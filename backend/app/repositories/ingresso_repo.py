import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ingresso import Ingresso, StatusIngresso
from app.models.lote import Lote
from app.models.pedido import PedidoItem


def _eager_load_options():
    return (
        selectinload(Ingresso.participante),
        selectinload(Ingresso.lote).selectinload(Lote.evento),
        selectinload(Ingresso.pedido_item),
    )


async def get_with_relations(db: AsyncSession, ingresso_id: str) -> Optional[Ingresso]:
    """
    Busca ingresso com participante, lote (e seu evento) e pedido_item carregados.
    Usado pela geração de PDF e pelos endpoints de detalhe.
    """
    stmt = (
        select(Ingresso)
        .options(*_eager_load_options())
        .where(Ingresso.id == ingresso_id)
    )

    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_by_qr_hash(db: AsyncSession, qr_hash: str) -> Optional[Ingresso]:
    """Busca ingresso pelo hash do QR Code, com relações carregadas."""
    stmt = (
        select(Ingresso)
        .options(*_eager_load_options())
        .where(Ingresso.qr_code_hash == qr_hash)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_pdf_url(db: AsyncSession, ingresso_id: str, pdf_url: str) -> None:
    """Atualiza a URL do PDF do ingresso."""
    ingresso = await db.get(Ingresso, ingresso_id)
    if ingresso:
        ingresso.pdf_url = pdf_url
        await db.commit()


async def update_status(
    db: AsyncSession, ingresso_id: str, status: StatusIngresso
) -> None:
    """Atualiza o status do ingresso."""
    ingresso = await db.get(Ingresso, ingresso_id)
    if ingresso:
        ingresso.status = status
        await db.commit()


async def get_by_pedido_id(db: AsyncSession, pedido_id: uuid.UUID) -> list[Ingresso]:
    """
    Busca todos os ingressos de um pedido (via JOIN em PedidoItem,
    já que Ingresso aponta para PedidoItem, não diretamente para Pedido).
    """
    stmt = (
        select(Ingresso)
        .join(PedidoItem, Ingresso.pedido_item_id == PedidoItem.id)
        .where(PedidoItem.pedido_id == pedido_id)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def list_by_participante(
    db: AsyncSession, participante_id: uuid.UUID
) -> list[Ingresso]:
    """
    Lista ingressos do participante, ordenados pelo evento mais próximo primeiro.
    Carrega lote.evento para o response.
    """
    stmt = (
        select(Ingresso)
        .options(*_eager_load_options())
        .where(Ingresso.participante_id == participante_id)
        .order_by(Ingresso.emitido_em.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())
