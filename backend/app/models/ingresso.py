import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StatusIngresso(str, enum.Enum):
    ATIVO = "ATIVO"
    UTILIZADO = "UTILIZADO"
    CANCELADO = "CANCELADO"


class Ingresso(Base):
    __tablename__ = "ingressos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    pedido_item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pedido_itens.id"), nullable=False)
    lote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("lotes_ingresso.id"), nullable=False)
    participante_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    qr_code_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    status: Mapped[StatusIngresso] = mapped_column(Enum(StatusIngresso), default=StatusIngresso.ATIVO, nullable=False)
    pdf_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    emitido_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
