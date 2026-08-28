from fastapi import APIRouter, HTTPException, status


router = APIRouter(prefix="/share", tags = ["ShareFile"])

@router.post("/upload")
async def download():
    