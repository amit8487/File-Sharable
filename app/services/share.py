from datetime import datetime, timedelta, UTC
from uuid import UUID

from fastapi import UploadFile, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload

from ..schemas.fileschema import UploadResponse, UploadParams, FileInfo, ShareInfoResponse
from ..core.config import get_settings
from ..database.models import Share, File
from .storage import LocalStorage
from ..core.utils.logic import generate_code, make_stored_filename, check_mime_type
from ..core.utils.redis_session import create_session_token, get_session_data, try_mark_counted
from ..core.security import hashed_password, verify_password


class ShareService:
    def __init__(self, session:AsyncSession, storage: LocalStorage):
        self.session = session
        self.storage = storage
    
    async def upload(self, files: list[UploadFile], param: UploadParams) -> UploadResponse:
        if files is None or not files or all(f == "" for f in files):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files uploaded",
            )
        
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
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File {original_filename} exceeds size limit",
                )
            
            total_file_size+=size

            if total_file_size>settings.max_total_file_size_bytes: #Delete file if exceeds size limit
                for i, *_ in saved:
                    await self.storage.delete_file(i)
                await self.storage.delete_file(stored_filename)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Total size exceeds limit",
                )

            saved.append((stored_filename, original_filename, size, mime_type))

        share = Share(
            unique_code = unique_code,
            password_hash = password_hash,
            expiry_at = expiry_at,
            download_limit = download_limit,
            total_size = total_file_size,
        )

        created_files = []
        for stored_filename, original_filename, size, mime_type in saved:
            file_record = File(
                original_filename = original_filename,
                stored_filename=stored_filename,
                file_size = size,
                mime_type = mime_type,
            )
            share.files.append(file_record)
            created_files.append(file_record)

        self.session.add(share)
        await self.session.commit()
        await self.session.refresh(share)
        await self.session.refresh(share, attribute_names=["files"]) #It is used to refresh files table
        
        return UploadResponse(
            code = share.unique_code,
            expires_at = share.expiry_at,
            files = [
                FileInfo(filename=f.original_filename, size=f.file_size, file_id=f.id)
                for f in share.files
                ],
        )


    async def get_share_info(self, code: str, password:str|None = None) -> ShareInfoResponse:
        statement = select(Share).where(Share.unique_code==code).options(selectinload(Share.files))
        result = await self.session.exec(statement)
        share = result.first() #changed it from .first to .one

        # Data check in database
        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Share not found",
            )

        # Password validation
        if share.password_hash is not None and (
            not password or not verify_password(password, share.password_hash)
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password required or incorrect",
            )


        # Time check
        expiry_at = share.expiry_at 
        if expiry_at.tzinfo is None: #tempory remove it in postgresSql
            expiry_at = expiry_at.replace(tzinfo = UTC)
        
        if expiry_at < datetime.now(UTC):
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Share has expired",
            )

        #Download limit check
        if share.download_count>=share.download_limit:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="You have reached download limit",
            )

        #token creation
        token = await create_session_token(str(share.id))

        file_list = [
            FileInfo(file_id = f.id, filename = f.original_filename, size = f.file_size)
            for f in share.files
        ]

        return ShareInfoResponse(
            code = share.unique_code,
            password_protected = share.password_hash is not None,
            expires_at = share.expiry_at,
            files = file_list,
            session_token = token
        )


    async def download_File(self, code:str, file_id:UUID, X_session_token:str):
        statement = select(Share).where(Share.unique_code == code)
        result = await self.session.exec(statement)
        share = result.first()

        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail= "File not found"
                )
        
        if share.download_count>=share.download_limit:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail= "You have reached Download limit",
                )

        #fetch File data
        file_record = await self.session.get(File, file_id)

        if not file_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )

        if file_record.share_id != share.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail= "You are accessing wrong file",
                )

        #Fetch session token
        session_data = await get_session_data(X_session_token)

        if session_data is None:
            raise HTTPException(
                status_code= status.HTTP_401_UNAUTHORIZED,
                detail = "Invalid or expired session token",
            )

        if session_data.get("share_id") != str(share.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Session does not belong to this share",
            )

        # Check file in storage
        if not await self.storage.file_exists(file_record.stored_filename):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File Missing from storage"
            )

        #file count increaes
        if await try_mark_counted(X_session_token):
            share.download_count+=1
            self.session.add(share)
            await self.session.commit()
        

        return StreamingResponse(
            self.storage.get_file(file_record.stored_filename),
            media_type=file_record.mime_type or "application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{file_record.original_filename}"'
            }
        )