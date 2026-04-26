import uuid
from datetime import datetime

from pydantic import BaseModel, Field, computed_field, model_validator

from app.models.lote import TipoLote


class LoteCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=255, examples=["1º Lote — Pista"])
    tipo: TipoLote = Field(..., examples=["INTEIRA"])
    preco: float = Field(..., ge=0, examples=[120.00])
    quantidade_total: int = Field(..., ge=1, examples=[500])
    data_inicio_venda: datetime = Field(..., examples=["2026-05-01T00:00:00"])
    data_fim_venda: datetime = Field(..., examples=["2026-12-30T23:59:00"])
    ativo: bool = Field(True, examples=[True])

    @model_validator(mode="after")
    def validar_periodo_venda(self) -> "LoteCreate":
        if self.data_fim_venda <= self.data_inicio_venda:
            raise ValueError(
                "data_fim_venda deve ser posterior a data_inicio_venda."
            )
        return self


class LoteUpdate(BaseModel):
    nome: str | None = Field(None, min_length=2, max_length=255)
    tipo: TipoLote | None = None
    preco: float | None = Field(None, ge=0)
    quantidade_total: int | None = Field(None, ge=1)
    data_inicio_venda: datetime | None = None
    data_fim_venda: datetime | None = None

    @model_validator(mode="after")
    def validar_periodo_venda(self) -> "LoteUpdate":
        if (
            self.data_inicio_venda is not None
            and self.data_fim_venda is not None
            and self.data_fim_venda <= self.data_inicio_venda
        ):
            raise ValueError(
                "data_fim_venda deve ser posterior a data_inicio_venda."
            )
        return self


class LoteResponse(BaseModel):
    id: uuid.UUID
    evento_id: uuid.UUID
    nome: str
    tipo: TipoLote
    preco: float
    quantidade_total: int
    quantidade_vendida: int
    data_inicio_venda: datetime
    data_fim_venda: datetime
    ativo: bool
    criado_em: datetime

    model_config = {"from_attributes": True}

    @computed_field  # type: ignore[prop-decorator]
    @property
    def quantidade_disponivel(self) -> int:
        return self.quantidade_total - self.quantidade_vendida
