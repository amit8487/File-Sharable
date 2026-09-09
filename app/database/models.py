from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime

from sqlmodel import SQLModel, Field, Relationship, column


class share(SQLModel, table = True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    unique_code : str = Field(index=True, unique=True)
    user_id: UUID = Field(default= None, default_factory= uuid4, foreign_key="user.id")
    password_hash: str = Field(default=None)
    expiry_at: datetime 
    created_at: datetime
    download_limit: int = Field(default=None)
    download_count: int = Field(default=None)
    total_size: int

class File(SQLModel, table = True):
    id: UUID = Field(primary_key=True, default_factory=uuid4)
    share_id: UUID = Field(index=True, foreign_key="share.unique_code")
    original_name:str
    stored_filename:str(unique=True)
    mime_type:str
    created_at:datetime