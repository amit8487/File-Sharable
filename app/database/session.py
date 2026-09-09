from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel


URL = "sqlite+aiosqlite:///database.db"

engine = create_async_engine(
    url = URL,
    echo = True
)

async def create_db_tables():
    async with engine.begin() as connection: #below import statement we will add name of class 
        from app.database.models import table, share# noqa: F401
        await connection.run_sync(SQLModel.metadata.create_all)

async_session = sessionmaker(
    bind = engine, 
    class_= AsyncSession,
    expire_on_commit= False,
)

async def get_session():
    async with async_session() as session:
        yield session