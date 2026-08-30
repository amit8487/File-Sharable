from app.core.utiles.logic import length, generate_code
from fastapi import APIRouter, HTTPException, UploadFile

router = APIRouter(prefix="/share", tags=["ShareFile"])

@router.post("/upload/")
async def upload(files: list[UploadFile] | None = None):
    #file_info = {}
    
    if files is None or not files or all(f == "" for f in files):
        raise HTTPException(status_code=400, detail="No file Uploaded")
    else:
        total_size:int = 0
        for file in files:
            if file == "":
                continue
            #file_info[file.filename] = await length(file)
            size = await length(file) #It return size in bytes
            total_size+=(size) #converting size into MB

            if ((total_size/1048576)>100): #If size is greater then 100MB, we'll raise error
                raise HTTPException(status_code=400, detail="File size is greater then expected limit")
        code = generate_code()

        return {"files": code}