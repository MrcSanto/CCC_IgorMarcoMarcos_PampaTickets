import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ReembolsoCreate(BaseModel):
    motivo: str | None = Field(default=None, max_length=500)


class ReembolsoResponse(BaseModel):
    id: uuid.UUID
    pagamento_id: uuid.UUID
    motivo: str | None
    valor_reembolsado: float
    processado_em: datetime | None

    model_config = {"from_attributes": True}
