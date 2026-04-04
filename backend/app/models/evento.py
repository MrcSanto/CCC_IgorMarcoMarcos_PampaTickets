import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StatusEvento(str, enum.Enum):
    RASCUNHO = "RASCUNHO"
    PUBLICADO = "PUBLICADO"
    ENCERRADO = "ENCERRADO"
    CANCELADO = "CANCELADO"


class Evento(Base):
    __tablename__ = "eventos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organizador_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("usuarios.id"), nullable=False
    )
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    data_fim: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    local: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[StatusEvento] = mapped_column(
        Enum(StatusEvento), default=StatusEvento.RASCUNHO, nullable=False
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
