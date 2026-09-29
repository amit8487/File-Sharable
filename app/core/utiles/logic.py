import secrets
from uuid import uuid4, UUID
from pathlib import Path


class file_operations:
    def generate_code() -> str: #generate secret code
        rnd = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijmnopqrstuvwxyz123456789$@#%"
        secret_code: str = ""
        for _ in range(6):
            secret_code += secrets.choice(rnd)
        return secret_code


    async def length(file): #calculate size of invidual file
        total_Size = 0
        chunk_size = 1048576
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            total_Size += len(chunk)
        
        return total_Size

    #uuid generator
    def generate_uuid() -> UUID:
            return uuid4()


    #rename file
    def rename_file(file, new_name) -> dict:
    current_filename = file.name
    new_file = file.with_stem(new_name)
    new_fileName = new_file.name
    current_filename.rename(new_file)

    return {
        "old_filename" : current_filename,
        "new_filename" : new_fileName
    }