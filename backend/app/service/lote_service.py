import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evento import Evento, StatusEvento
from app.models.lote import Lote
from app.models.usuario import Usuario
from app.repositories import evento_repo, lote_repo
from app.schemas.lote import LoteCreate, LoteUpdate

_STATUS_EVENTO_GERENCIAVEIS = {StatusEvento.RASCUNHO, StatusEvento.PUBLICADO}


async def criar(
    db: AsyncSession,
    organizador: Usuario,
    evento_id: uuid.UUID,
    data: LoteCreate,
) -> Lote:
    evento = await _obter_evento_proprio(db, organizador, evento_id)
    _exigir_evento_gerenciavel(evento)
    _validar_datas_venda(evento, data.data_inicio_venda, data.data_fim_venda)
    return await lote_repo.create(
        db,
        evento_id=evento.id,
        nome=data.nome,
        tipo=data.tipo,
        preco=data.preco,
        quantidade_total=data.quantidade_total,
        data_inicio_venda=data.data_inicio_venda,
        data_fim_venda=data.data_fim_venda,
        ativo=data.ativo,
    )


async def listar_publicos_do_evento(
    db: AsyncSession, evento_id: uuid.UUID
) -> list[Lote]:
    evento = await evento_repo.get_by_id(db, evento_id)
    if evento is None or evento.status not in {
        StatusEvento.PUBLICADO,
        StatusEvento.ENCERRADO,
    }:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )
    return await lote_repo.list_ativos_by_evento(db, evento_id)


async def listar_do_organizador(
    db: AsyncSession, organizador: Usuario, evento_id: uuid.UUID
) -> list[Lote]:
    evento = await _obter_evento_proprio(db, organizador, evento_id)
    return await lote_repo.list_by_evento(db, evento.id)


async def editar(
    db: AsyncSession,
    organizador: Usuario,
    lote_id: uuid.UUID,
    data: LoteUpdate,
) -> Lote:
    lote, evento = await _obter_lote_proprio(db, organizador, lote_id)
    _exigir_evento_gerenciavel(evento)

    campos = data.model_dump(exclude_unset=True)
    if not campos:
        return lote

    nova_qtd_total = campos.get("quantidade_total", lote.quantidade_total)
    if nova_qtd_total < lote.quantidade_vendida:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "quantidade_total não pode ser inferior à quantidade já vendida "
                f"({lote.quantidade_vendida})."
            ),
        )

    novo_inicio = campos.get("data_inicio_venda", lote.data_inicio_venda)
    novo_fim = campos.get("data_fim_venda", lote.data_fim_venda)
    if novo_fim <= novo_inicio:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="data_fim_venda deve ser posterior a data_inicio_venda.",
        )
    _validar_datas_venda(evento, novo_inicio, novo_fim)

    return await lote_repo.update(db, lote, **campos)


async def ativar(db: AsyncSession, organizador: Usuario, lote_id: uuid.UUID) -> Lote:
    lote, evento = await _obter_lote_proprio(db, organizador, lote_id)
    _exigir_evento_gerenciavel(evento)
    return await lote_repo.update_ativo(db, lote, True)


async def desativar(db: AsyncSession, organizador: Usuario, lote_id: uuid.UUID) -> Lote:
    lote, evento = await _obter_lote_proprio(db, organizador, lote_id)
    _exigir_evento_gerenciavel(evento)
    return await lote_repo.update_ativo(db, lote, False)


async def deletar(db: AsyncSession, organizador: Usuario, lote_id: uuid.UUID) -> None:
    lote, evento = await _obter_lote_proprio(db, organizador, lote_id)
    _exigir_evento_gerenciavel(evento)
    if lote.quantidade_vendida > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não é possível deletar um lote que já possui vendas.",
        )
    await lote_repo.delete(db, lote)


async def _obter_evento_proprio(
    db: AsyncSession, organizador: Usuario, evento_id: uuid.UUID
) -> Evento:
    evento = await evento_repo.get_by_id(db, evento_id)
    if evento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado.",
        )
    if evento.organizador_id != organizador.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não é o organizador deste evento.",
        )
    return evento


async def _obter_lote_proprio(
    db: AsyncSession, organizador: Usuario, lote_id: uuid.UUID
) -> tuple[Lote, Evento]:
    lote = await lote_repo.get_by_id(db, lote_id)
    if lote is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lote não encontrado.",
        )
    evento = await _obter_evento_proprio(db, organizador, lote.evento_id)
    return lote, evento


def _exigir_evento_gerenciavel(evento: Evento) -> None:
    if evento.status not in _STATUS_EVENTO_GERENCIAVEIS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Lotes só podem ser gerenciados em eventos em rascunho ou publicados.",
        )


def _validar_datas_venda(evento: Evento, data_inicio_venda, data_fim_venda) -> None:
    if data_inicio_venda >= evento.data_inicio:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="data_inicio_venda deve ser anterior à data de início do evento.",
        )
    if data_fim_venda > evento.data_inicio:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="data_fim_venda não pode ser posterior à data de início do evento.",
        )
