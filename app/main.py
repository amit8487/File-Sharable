import asyncio
import logging
from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from contextlib import asynccontextmanager

from app.api.master_router import master_router
from app.database.session import create_db_tables
from app.core.utils.cleanup import cleanup_expired_files

from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_db_tables()

    task = asyncio.create_task(cleanup_expired_files())
    yield

    task.cancel()


app = FastAPI(
    lifespan= lifespan_handler
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(master_router)


@app.get("/scalar", include_in_schema = False)
def get_scalar_docs():
    return get_scalar_api_reference(
        openapi_url= app.openapi_url,
        title = "Scalar API",
    )