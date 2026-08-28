from fastapi import APIRouter
from app.api.router import share

master_router = APIRouter()

master_router.include_router(share.router)