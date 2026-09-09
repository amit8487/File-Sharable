from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

class Share(SQLModel, table = True):
    __tablename__ = "shares"
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    unique_code : str = Field(index=True, unique=True)
    user_id: Optional[UUID] = Field(default=None)
    password_hash: Optional[str] = Field(default=None)
    expiry_at: datetime 
    created_at: datetime
    download_limit: int = Field(default=5)
    download_count: int = Field(default=0)
    total_size: int = Field(default=0)

    files: List["File"] = Relationship(back_populates="share", cascade_delete=True)

class File(SQLModel, table = True):
    __tablename__ = "files"
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    share_id: UUID = Field(foreign_key="shares.id", index=True)
    original_name:str
    stored_filename:str = Field(unique=True)
    file_size: int
    mime_type:str
    created_at:datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    share: "Share" = Relationship(back_populates="files")