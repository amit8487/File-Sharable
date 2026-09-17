from pathlib import Path
import aiofiles

chunkSize = 64*1024 #64KB chunk size
class FileOperations:
    def __init__(self, base_path:str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def get_file(self, storedFileName: str) -> bytes: #This function will return file in bytes
        filePath = self.base_path/storedFileName

        if not filePath.exists():
            raise FileExistsError(f"File {storedFileName} not found")
        
        async with aiofiles.open(filePath, "rb") as f:
            while True:
                chunk = await f.read(chunkSize) #It reads 64KB and returns Yield to user and again and again
                if not chunk:
                    break
                yield chunk

    async def save_file(self, storedFileName: str, content: bytes) -> None:
        filePath = self.base_path/storedFileName

        async with aiofiles.open(filePath, "wb") as f:
            await f.write(content)

    async def delete_file(self, storedFileName:str) -> None:
        filePath = self.base_path/storedFileName
        filePath.unlink(missing_ok=True)