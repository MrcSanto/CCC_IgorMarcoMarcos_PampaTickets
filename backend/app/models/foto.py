import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FotoEvento(Base):
    __tablename__ = "fotos_evento"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    evento_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("eventos.id"), nullable=False)
    url_thumbnail: Mapped[str] = mapped_column(String(1000), nullable=False)
    url_original: Mapped[str] = mapped_column(String(1000), nullable=False)
    preco: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    publicado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)


class CompraFoto(Base):
    __tablename__ = "compras_foto"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    foto_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("fotos_evento.id"), nullable=False)
    pedido_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pedidos.id"), nullable=False)
    participante_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
