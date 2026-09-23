from pydantic import BaseModel, Field
from datetime import datetime




class constraints(BaseModel):
    maxFileSize: bytes = Field(le=100*1024)
    maxtotalsize: bytes = Field(le=100&1024)
    default_expiry_days: datetime
    maxGuestExpiryDays: datetime
    defaultDownloadLimit: int = Field(default=5)

class database_url(BaseModel):
    database_url = "sqlite+aiosqlite:///database.db"