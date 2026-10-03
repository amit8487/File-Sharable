from datetime import datetime, timedelta, UTC
from uuid import uuid4

from fastapi import UploadFile, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.fileschema import UploadResponse, UploadParams
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
        password_hash:str = hashed_password(param.password_hash) if param.password_hash else None


        unique_code:str = generate_code()
        saved = []
        total_file_size:int = 0

        for file in files:
            if file == "":
                continue

            original_filename = file.filename or "unnamed"
            stored_filename = make_stored_filename(original_filename)
            size:int = await self.storage.save_file(stored_filename, file)

            if size > settings.max_file_size_bytes:
                await self.storage.delete_file(stored_filename)
                raise HTTPException(400, f"File {original_filename} exceeds size limit")
            
            total_file_size+=size

            if total_file_size>settings.max_total_file_size_bytes:
                for 