from pydantic import BaseModel
from datetime import datetime

class FileInfo(BaseModel):
    filename: str
    size: int

class UploadResponse(BaseModel):
    code: str
    expires_at: datetime
    files: list[FileInfo]