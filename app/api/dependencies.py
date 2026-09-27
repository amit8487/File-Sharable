from app.core.config import get_settings
from app.database.session import get_session
from app.services.storage import LocalStorage

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated


#session dependice
SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_storage() -> LocalStorage:
    return LocalStorage(get_settings().storage_path)

StorageDep = Annotated[LocalStorage, Depends(get_storage)]