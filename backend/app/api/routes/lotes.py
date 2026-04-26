import uuid

from fastapi import APIRouter, Response, status

from app.api.deps import DbDep, OrganizadorUser
from app.schemas.lote import LoteCreate, LoteResponse, LoteUpdate
from app.service import lote_service

router = APIRouter(tags=["Lotes"])


@router.post(
    "/eventos/{evento_id}/lotes",
    response_model=LoteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def criar_lote(
    evento_id: uuid.UUID,
    data: LoteCreate,
    db: DbDep,
    organizador: OrganizadorUser,
):
    return await lote_service.criar(db, organizador, evento_id, data)


@router.get(
    "/eventos/{evento_id}/lotes", response_model=list[LoteResponse]
)
async def listar_lotes_publicos(evento_id: uuid.UUID, db: DbDep):
    return await lote_service.listar_publicos_do_evento(db, evento_id)


@router.get(
    "/organizador/eventos/{evento_id}/lotes",
    response_model=list[LoteResponse],
)
async def listar_lotes_organizador(
    evento_id: uuid.UUID, db: DbDep, organizador: OrganizadorUser
):
    return await lote_service.listar_do_organizador(db, organizador, evento_id)


@router.put("/lotes/{lote_id}", response_model=LoteResponse)
async def editar_lote(
    lote_id: uuid.UUID,
    data: LoteUpdate,
    db: DbDep,
    organizador: OrganizadorUser,
):
    return await lote_service.editar(db, organizador, lote_id, data)


@router.patch("/lotes/{lote_id}/ativar", response_model=LoteResponse)
async def ativar_lote(
    lote_id: uuid.UUID, db: DbDep, organizador: OrganizadorUser
):
    return await lote_service.ativar(db, organizador, lote_id)


@router.patch("/lotes/{lote_id}/desativar", response_model=LoteResponse)
async def desativar_lote(
    lote_id: uuid.UUID, db: DbDep, organizador: OrganizadorUser
):
    return await lote_service.desativar(db, organizador, lote_id)


@router.delete("/lotes/{lote_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_lote(
    lote_id: uuid.UUID, db: DbDep, organizador: OrganizadorUser
):
    await lote_service.deletar(db, organizador, lote_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
