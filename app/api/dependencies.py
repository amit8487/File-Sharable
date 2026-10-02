from app.core.config import get_settings
from app.database.session import get_session
from app.services.storage import LocalStorage
from ..services.share import ShareService

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated


#session dependice
SessionDep = Annotated[AsyncSession, Depends(get_session)]

#function connecting storgae
def get_storage() -> LocalStorage:
    return LocalStorage(get_settings().storage_path)
#storage dependecie
StorageDep = Annotated[LocalStorage, Depends(get_storage)]

#Below function and depedency connecting both depedencies
def get_share_service(session: SessionDep, storage: StorageDep) -> ShareService:
    return ShareService(session, storage)
ShareServiceDep = Annotated[ShareService, Depends(get_share_service)]