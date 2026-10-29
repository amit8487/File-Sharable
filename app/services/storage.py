from pathlib import Path
from typing import AsyncGenerator
import aiofiles
from fastapi import UploadFile



#64KB Chunk Size
CHUNK_SIZE = 64*1024

class LocalStorage:
    def __init__(self, base_path:str|Path):
        #self.base_path = Path(base_path)
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def file_exists(self, stored_filename: str) -> bool:
        return (self.base_path / stored_filename).exists()

    async def get_file(self, stored_filename: str) -> AsyncGenerator[bytes, None]: #This function will return file in bytes
        file_path = self.base_path/stored_filename

        if not file_path.exists():
            raise FileNotFoundError(f"File {stored_filename} not found")
        
        async with aiofiles.open(file_path, "rb") as f:
            while True:
                #It reads 64KB and returns Yield to user and again and again
                chunk = await f.read(CHUNK_SIZE) 
                if not chunk:
                    break
                yield chunk

    async def save_file(self, stored_filename: str, upload_file: UploadFile) -> int:
        file_path = self.base_path/stored_filename
        total_size = 0

        try:
            async with aiofiles.open(file_path, "wb") as f:
                
                while chunk:= await upload_file.read(CHUNK_SIZE):
                    await f.write(chunk)
                    total_size+=len(chunk)
            return total_size
        except Exception:
            if file_path.exists():
                file_path.unlink(missing_ok=True)
            raise

    async def delete_file(self, stored_filename:str) -> None:
        file_path = self.base_path/stored_filename
        file_path.unlink(missing_ok=True)