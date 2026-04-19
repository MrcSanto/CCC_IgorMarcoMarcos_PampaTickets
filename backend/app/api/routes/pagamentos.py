# TODO: remover este arquivo após os testes
import uuid

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.api.deps import DbDep
from app.models.pagamento import MetodoPagamento, Pagamento
from app.models.pedido import Pedido
from app.repositories import pagamento_repo

router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])


class CriarPagamentoRequest(BaseModel):
    pedido_id: uuid.UUID
    metodo: MetodoPagamento
    valor: float
    charge_id: str | None = None


class PagamentoResponse(BaseModel):
    id: uuid.UUID
    pedido_id: uuid.UUID
    metodo: MetodoPagamento
    valor: float
    charge_id: str | None

    model_config = {"from_attributes": True}


@router.post("", response_model=PagamentoResponse, status_code=status.HTTP_201_CREATED)
async def criar_pagamento(data: CriarPagamentoRequest, db: DbDep) -> Pagamento:
    if not await db.get(Pedido, data.pedido_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado."
        )

    return await pagamento_repo.create(
        db,
        pedido_id=data.pedido_id,
        metodo=data.metodo,
        valor=data.valor,
        charge_id=data.charge_id,
    )
