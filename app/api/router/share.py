from fastapi import APIRouter, HTTPException, UploadFile, Form, Header

from uuid import UUID

from ...schemas.fileschema import UploadParams, UploadResponse, ShareInfoResponse
from typing import Annotated
from ..dependencies import ShareServiceDep


router = APIRouter(prefix="/share", tags=["ShareFile"])


@router.post("/upload/", response_model=UploadResponse, status_code=201)
async def upload(
    files: list[UploadFile],
    password_hash: Annotated[str | None, Form()] = None,
    expiry_days: Annotated[int | None, Form()] = None,
    download_limit: Annotated[int | None, Form()] = None,
    service: ShareServiceDep = ...,
):
    params = UploadParams(
        password_hash=password_hash,
        expiry_days=expiry_days,
        download_limit=download_limit,
    )
    return await service.upload(files, params)

@router.get("/{code}", response_model = ShareInfoResponse)
async def get_info(
    code: str,
    service: ShareServiceDep,
    x_share_password: str | None = Header(default = None),
    ):
    return await service.get_share_info(code, x_share_password)


@router.get("/{code}/files/{file_id}")
async def download_file(
    code: str,
    file_id: UUID,
    service: ShareServiceDep,
    x_session_token: str|None = Header(default=None),
):
    return await service.download_File(code, file_id, x_session_token)

@router.get("/{code}/qr")
async def qr(
    code:str,
    service:ShareServiceDep
):
    return await service.download_QR_code(code)