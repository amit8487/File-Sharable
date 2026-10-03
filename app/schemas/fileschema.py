from pydantic import BaseModel
from datetime import datetime
from pydantic import Field
from typing import Optional

from ..core.config import get_settings

class FileInfo(BaseModel):
    filename: str
    size: int

class UploadResponse(BaseModel):
    code: str
    expires_at: datetime
    files: list[FileInfo]


class UploadParams(BaseModel):
    password_hash: str | None = Field(default=None)
    expiry_days: int | None = Field(default = None, ge = 1, le = 5)
    download_limit: int | None = Field(default = None, ge = 1, le = 5)



# class FileUpload(UploadResponse):
#     password: Optional[str] = Field(default=None)