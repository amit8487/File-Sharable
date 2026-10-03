from fastapi import APIRouter, HTTPException, UploadFile, Form
from ...schemas.fileschema import UploadParams, UploadResponse
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

