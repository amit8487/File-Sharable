import secrets


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