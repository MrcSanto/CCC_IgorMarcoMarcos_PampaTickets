from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncEngine


class Base(DeclarativeBase):
    pass


# Importar todos os models aqui para que o Alembic os detecte nas migrações
# from app.models.usuario import Usuario  # descomente conforme os models forem criados


async def init_models(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)