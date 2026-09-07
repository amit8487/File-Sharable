from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference

from app.api.master_router import master_router
from app.database.session import create_db_tables
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_db_tables()
    yield


app = FastAPI(
    lifespan= lifespan_handler
)


app.include_router(master_router)


@app.get("/scalar", include_in_schema = False)
def get_scalar_docs():
    return get_scalar_api_reference(
        openapi_url= app.openapi_url,
        title = "Scalar API",
    )