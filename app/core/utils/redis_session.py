import json
from uuid import uuid4
from .redis_client import redis_client as rc

SESSION_TTL = 20*60

async def create_session_token(share_id: str)->str:
    token:str = str(uuid4())
    data:dict = {"share_id": share_id} #share_id <- primary key of share table

    await rc.setex(
        name = f"session:{token}",
        time = SESSION_TTL,
        value = json.dumps(data),
    )
    return token

async def get_session_data(token: str)->dict|None:
    raw_data = await rc.get(f"session:{token}")
    if not raw_data:
        return None
    return json.loads(raw_data)

async def try_mark_counted(token:str)->bool:
    result = await rc.set(f"counted:{token}", 1, nx=True, ex=SESSION_TTL)
    return result is True