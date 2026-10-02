import secrets
from uuid import uuid4, UUID
from pathlib import Path



#generate secret code
def generate_code() -> str: 
    rnd = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijmnopqrstuvwxyz123456789$@#%"
    secret_code: str = ""
    for _ in range(6):
        secret_code += secrets.choice(rnd)
    return secret_code


#rename file
def make_stored_filename(original_filename:str) -> str:
    extension = Path(original_filename).suffix
    return f"{uuid4()}{extension}" 