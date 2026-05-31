import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.ingresso import Ingresso, StatusIngresso


class IngressoResponse(BaseModel):
    id: uuid.UUID
    qr_code_hash: str
    status: StatusIngresso
    pdf_url: str | None
    emitido_em: datetime
    evento_nome: str
    evento_data_inicio: datetime
    evento_local: str
    lote_nome: str

    model_config = {"from_attributes": True}

    @classmethod
    def from_ingresso(cls, ing: Ingresso) -> "IngressoResponse":
        return cls(
            id=ing.id,
            qr_code_hash=ing.qr_code_hash,
            status=ing.status,
            pdf_url=ing.pdf_url,
            emitido_em=ing.emitido_em,
            evento_nome=ing.lote.evento.nome,
            evento_data_inicio=ing.lote.evento.data_inicio,
            evento_local=ing.lote.evento.local,
            lote_nome=ing.lote.nome,
        )


class IngressoOrganizadorResponse(BaseModel):
    id: uuid.UUID
    status: StatusIngresso
    emitido_em: datetime
    lote_nome: str
    participante_nome: str
    participante_email: str

    model_config = {"from_attributes": True}

    @classmethod
    def from_ingresso(cls, ing: Ingresso) -> "IngressoOrganizadorResponse":
        return cls(
            id=ing.id,
            status=ing.status,
            emitido_em=ing.emitido_em,
            lote_nome=ing.lote.nome,
            participante_nome=ing.participante.nome,
            participante_email=ing.participante.email,
        )
