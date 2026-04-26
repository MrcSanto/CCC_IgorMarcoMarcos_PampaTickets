import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.pedido import Pedido, PedidoItem, StatusPedido


async def get_by_id(db: AsyncSession, pedido_id: uuid.UUID) -> Pedido | None:
    result = await db.execute(select(Pedido).where(Pedido.id == pedido_id))
    return result.scalar_one_or_none()


async def get_by_id_com_itens(
    db: AsyncSession, pedido_id: uuid.UUID
) -> Pedido | None:
    result = await db.execute(
        select(Pedido)
        .options(joinedload(Pedido.itens))
        .where(Pedido.id == pedido_id)
        .execution_options(populate_existing=True)
    )
    return result.unique().scalar_one_or_none()


async def list_by_participante(
    db: AsyncSession, participante_id: uuid.UUID
) -> list[Pedido]:
    result = await db.execute(
        select(Pedido)
        .options(joinedload(Pedido.itens))
        .where(Pedido.participante_id == participante_id)
        .order_by(Pedido.criado_em.desc())
    )
    return list(result.unique().scalars().all())


async def update_status(
    db: AsyncSession, pedido: Pedido, novo_status: StatusPedido
) -> Pedido:
    pedido.status = novo_status
    await db.commit()
    await db.refresh(pedido)
    return pedido
