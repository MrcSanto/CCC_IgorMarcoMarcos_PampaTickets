import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Relatorio(Base):
    __tablename__ = "relatorios"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    evento_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("eventos.id"), nullable=False
    )
    organizador_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("usuarios.id"), nullable=False
    )
    pdf_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    gerado_em: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
