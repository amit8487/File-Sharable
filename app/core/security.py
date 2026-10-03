import bcrypt

def hashed_password(password: str) -> str:
    hash_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    return hash_password