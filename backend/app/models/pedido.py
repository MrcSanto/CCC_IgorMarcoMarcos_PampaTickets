import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StatusPedido(str, enum.Enum):
    PENDENTE = "PENDENTE"
    PAGO = "PAGO"
    CANCELADO = "CANCELADO"
    REEMBOLSADO = "REEMBOLSADO"


class Pedido(Base):
    __tablename__ = "pedidos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    participante_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    evento_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("eventos.id"), nullable=False)
    cupom_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("cupons.id"), nullable=True)
    valor_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    valor_desconto: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    status: Mapped[StatusPedido] = mapped_column(Enum(StatusPedido), default=StatusPedido.PENDENTE, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)


class PedidoItem(Base):
    __tablename__ = "pedido_itens"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    pedido_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pedidos.id"), nullable=False)
    lote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("lotes_ingresso.id"), nullable=False)
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    preco_unitario: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
