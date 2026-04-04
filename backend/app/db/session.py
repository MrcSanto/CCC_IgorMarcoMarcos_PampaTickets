from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings
from app.db.base import init_models

db_url = settings.ASYNC_DATABASE_URL
engine = create_async_engine(db_url, echo=False, future=True)
SessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


async def get_db():
    async with SessionLocal() as session:
        yield session


async def init_db() -> None:
    await init_models(engine)
