from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncEngine


class Base(DeclarativeBase):
    pass


# Importar todos os models aqui para que o Alembic os detecte nas migrações
from app.models.usuario import Usuario  # noqa: F401
from app.models.evento import Evento  # noqa: F401
from app.models.lote import Lote  # noqa: F401
from app.models.cupom import Cupom  # noqa: F401
from app.models.pedido import Pedido, PedidoItem  # noqa: F401
from app.models.pagamento import Pagamento, Reembolso  # noqa: F401
from app.models.ingresso import Ingresso  # noqa: F401
from app.models.cortesia import Cortesia  # noqa: F401
from app.models.checkin import Checkin  # noqa: F401
from app.models.certificado import Certificado  # noqa: F401
from app.models.relatorio import Relatorio  # noqa: F401
from app.models.foto import FotoEvento, CompraFoto  # noqa: F401


async def init_models(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)