from datetime import datetime, timedelta, UTC
from uuid import uuid4

from fastapi import UploadFile, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.fileschema import UploadResponse
from ..core.config import get_settings
from ..database.models import Share, File
from .storage import LocalStorage
from ..core.utiles.logic import generate_code, make_stored_filename


class ShareService:
    def __init__(self, session:AsyncSession, storage: LocalStorage):
        self.session = session
        self.storage = storage
    
    async def upload(self, files: list[UploadFile]) -> UploadResponse:
        