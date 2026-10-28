import asyncio
import logging
from datetime import datetime, UTC
from sqlmodel import select
from sqlalchemy.orm import selectinload

from ...database.session import async_session
from ...database.models import Share
from ...services.storage import LocalStorage
from ...core.config import get_settings

logger = logging.getLogger(__name__)

async def cleanup_expired_files():
    logger.info(f"{'~'*10} Cleanup task started {'~'*10}")
    storage = LocalStorage(get_settings().storage_path)

    while True:
        async with async_session() as session:
            now = datetime.now(UTC)
            statement = (
                select(Share)
                .where(Share.expiry_at < now)
                .options(selectinload(Share.files))
            )
            result = await session.exec(statement)
            all_shares = result.all()

            deleted_shares:int = 0
            deleted_files:int = 0

            for share in all_shares:
                try:
                    for file in share.files:
                        await storage.delete_file(file.stored_filename)
                        deleted_files+=1    

                except OSError:
                    logger.exception(
                        "Failed to delete storage file %s for expired share %s",
                        file.stored_filename,
                        share.id,
                    )
                    continue
                deleted_shares+=1
                await session.delete(share)

            await session.commit()
            logger.info(f"🧹 Cleanup: Deleted {deleted_shares} expired shares and {deleted_files} files")

        await asyncio.sleep(3600)