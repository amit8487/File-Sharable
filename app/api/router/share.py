from fastapi import APIRouter, HTTPException, UploadFile, Form, status
from app.core.utiles.logic import length, generate_code
from ...schemas.fileschema import UploadParams, UploadResponse
from typing import Annotated
from ..dependencies import ShareServiceDep


router = APIRouter(prefix="/share", tags=["ShareFile"])

@router.post("/upload/", response_model=UploadResponse)
async def upload(
    files: list[UploadFile],
    parameters: Annotated[UploadParams, Form()],
    service: ShareServiceDep
    ):

    if files is None: 
        raise HTTPException(
            status_code = 404,
            detail = "No files Uploaded",
            )
    
    return service.upload(files, parameters)

# @router.post("/upload/")
# async def upload(
#     files: list[UploadFile] | None = None,
#     password: str | None = Form(default =None),
#     expiry_days: int | None = Form (default = None),
#     download_limit: int | None = Form(default = None),
#     ):
    
#     if files is None or not files or all(f == "" for f in files):
#         raise HTTPException(status_code=400, detail="No file Uploaded")
#     else:
#         total_size:int = 0
#         for file in files:
#             if file == "":
#                 continue
#             #file_info[file.filename] = await length(file)
#             size = await length(file) #It return size in bytes
#             total_size+=(size) #converting size into MB

#             if ((total_size/1048576)>100): #If size is greater then 100MB, we'll raise error
#                 raise HTTPException(status_code=400, detail="File size is greater then expected limit")
#         code = generate_code()

#         return {"files": code}