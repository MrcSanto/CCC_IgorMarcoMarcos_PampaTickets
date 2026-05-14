import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pagamento import Reembolso


async def create(
    db: AsyncSession,
    *,
    pagamento_id: uuid.UUID,
    valor: float,
    motivo: str | None,
) -> Reembolso:
    reembolso = Reembolso(
        pagamento_id=pagamento_id,
        valor_reembolsado=valor,
        motivo=motivo,
    )
    db.add(reembolso)
    await db.commit()
    await db.refresh(reembolso)
    return reembolso


async def get_by_pagamento_id(
    db: AsyncSession, pagamento_id: uuid.UUID
) -> Reembolso | None:
    stmt = select(Reembolso).where(Reembolso.pagamento_id == pagamento_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def marcar_processado(
    db: AsyncSession, reembolso: Reembolso
) -> Reembolso:
    reembolso.processado_em = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(reembolso)
    return reembolso
