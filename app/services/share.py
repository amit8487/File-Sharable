from datetime import datetime, timedelta, UTC

from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.fileschema import UploadResponse, UploadParams, FileInfo
from ..core.config import get_settings
from ..database.models import Share, File
from .storage import LocalStorage
from ..core.utiles.logic import generate_code, make_stored_filename, check_mime_type
from ..core.security import hashed_password



class ShareService:
    def __init__(self, session:AsyncSession, storage: LocalStorage):
        self.session = session
        self.storage = storage
    
    async def upload(self, files: list[UploadFile], param: UploadParams) -> UploadResponse:
        if files is None or not files or all(f == "" for f in files):
            raise HTTPException(400, "No files uploaded")
        
        settings = get_settings()

        expiry_days:int = param.expiry_days or settings.default_expiry_days
        expiry_at:datetime = datetime.now(UTC)+timedelta(days = expiry_days)
        download_limit:int = param.download_limit or settings.default_download_limit
        password_hash:str|None= hashed_password(param.password_hash) if param.password_hash else None


        unique_code:str = generate_code()
        saved = []
        total_file_size:int = 0

        for file in files:
            if file == "":
                continue

            original_filename = file.filename or "unnamed"
            stored_filename = make_stored_filename(original_filename)
            mime_type = await check_mime_type(file)
            size:int = await self.storage.save_file(stored_filename, file)

            if size > settings.max_file_size_bytes:
                await self.storage.delete_file(stored_filename)
                raise HTTPException(400, f"File {original_filename} exceeds size limit")
            
            total_file_size+=size

            if total_file_size>settings.max_total_file_size_bytes: #Delete file if exceeds size limit
                for i, *_ in saved:
                    await self.storage.delete_file(i)
                await self.storage.delete_file(stored_filename)
                raise HTTPException(400, "Total size exceeds limit")

            saved.append((stored_filename, original_filename, size, mime_type))

        share = Share(
            unique_code = unique_code,
            password_hash = password_hash,
            expiry_at = expiry_at,
            download_limit = download_limit,
            total_size = total_file_size,
        )

        for stored_filename, original_filename, size, mime_type in saved:
            share.files.append(File(
                original_filename = original_filename,
                stored_filename=stored_filename,
                file_size = size,
                mime_type = mime_type,
            ))

        self.session.add(share)
        await self.session.commit()
        await self.session.refresh(share)
        
        return UploadResponse(
            code = share.unique_code,
            expires_at = share.expiry_at,
            files = [FileInfo(filename=fn, size = sz) for _, fn, sz, _ in saved],
        )