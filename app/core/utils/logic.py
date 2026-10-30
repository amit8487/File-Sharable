import magic
import secrets
import segno
import io

from uuid import uuid4, UUID
from pathlib import Path
from fastapi import UploadFile

#generate secret code
def generate_code() -> str: 
    rnd = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijmnopqrstuvwxyz123456789"
    secret_code: str = ""
    for _ in range(6):
        secret_code += secrets.choice(rnd)
    return secret_code


#rename file
def make_stored_filename(original_filename:str) -> str:
    extension = Path(original_filename).suffix
    return f"{uuid4()}{extension}" 

#Check file MIME type
async def check_mime_type(file: UploadFile) -> str:
    content = await file.read(2048)
    real_mime_type: str = magic.from_buffer(content, mime=True)
    await file.seek(0)

    return real_mime_type

#QR code generator 
def QR_code_generator(url:str)-> bytes:
    qrcode = segno.make_qr(
        url,
        error='m'
        )

    buffer = io.BytesIO()

    qrcode.save(
        buffer,
        kind = "png",
        scale = 10,
        border = 3,
        dark = "#1a1a2e",
        light = "#ffffff"
        )
    
    return buffer.getvalue()