import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Checkin(Base):
    __tablename__ = "checkins"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    ingresso_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ingressos.id"), nullable=False)
    realizado_por: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    realizado_em: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
