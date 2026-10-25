from pydantic import BaseModel
from datetime import datetime
from pydantic import Field
from uuid import UUID


class FileInfo(BaseModel):
    filename: str
    size: int
    file_id: UUID

class UploadResponse(BaseModel):
    code: str
    expires_at: datetime
    files: list[FileInfo]


class UploadParams(BaseModel):
    password_hash: str | None = Field(default=None)
    expiry_days: int | None = Field(default = None, ge = 1, le = 5)
    download_limit: int | None = Field(default = None, ge = 1, le = 5)

class ShareInfoResponse(UploadResponse):
    password_protected: bool
    session_token: str

