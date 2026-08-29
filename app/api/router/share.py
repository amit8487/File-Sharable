from fastapi import APIRouter, HTTPException, UploadFile

router = APIRouter(prefix="/share", tags=["ShareFile"])

@router.post("/upload/")
async def upload(files: list[UploadFile] | None = None):
    file_info = {}
   
    if not files or files is None:
        raise HTTPException(status_code=400, detail="No file Uploaded")
    else:
        for file in files:
            content = await  file.read()
            if(content == ""):
                continue
            file_info[file.filename] = len(content)


        return {"files": file_info}