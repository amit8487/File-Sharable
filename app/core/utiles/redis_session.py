import json
from uuid import uuid4
from .redis_client import redis_client as rc

async def create_session_token(share_id: str)->str:
    token:str = str(uuid4())
    data:dict = {"share_id": share_id, "counted": False} #share_id <- primary key of share table

    await rc.setex(f"session:{token}", 1200, json.dumps(data))


async def get_session_data(token: str)->dict|None:
    raw_data = await rc.get(f"session:{token}")
    if not raw_data:
        return None
    return json.loads(raw_data)