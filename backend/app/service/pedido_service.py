import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.asaas import charges as asaas_charges
from app.integrations.asaas.exceptions import AsaasAPIError
from app.models.evento import StatusEvento
from app.models.pagamento import StatusPagamento
from app.models.pedido import Pedido, PedidoItem, StatusPedido
from app.models.usuario import Usuario
from app.repositories import evento_repo, lote_repo, pagamento_repo, pedido_repo
from app.schemas.pedido import PedidoCreate
from app.service import pagamento_service


async def criar(
    db: AsyncSession, participante: Usuario, data: PedidoCreate
) -> dict:
    evento = await evento_repo.get_by_id(db, data.evento_id)
    if evento is None or evento.status != StatusEvento.PUBLICADO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado ou não está publicado.",
        )

    if not participante.asaas_customer_id:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Participante sem cadastro no gateway de pagamento.",
        )

    agora = datetime.now(timezone.utc).replace(tzinfo=None)
    lotes_validos: list[tuple] = []
    valor_total = 0.0

    for item in data.itens:
        lote = await lote_repo.get_by_id(db, item.lote_id)

        if lote is None or lote.evento_id != evento.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lote {item.lote_id} não encontrado neste evento.",
            )
        if not lote.ativo:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Lote '{lote.nome}' não está disponível para venda.",
            )
        if not (lote.data_inicio_venda <= agora <= lote.data_fim_venda):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Lote '{lote.nome}' está fora da janela de venda.",
            )
        disponivel = lote.quantidade_total - lote.quantidade_vendida
        if item.quantidade > disponivel:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Lote '{lote.nome}' possui apenas {disponivel} "
                    "ingresso(s) disponível(is)."
                ),
            )

        valor_total += float(lote.preco) * item.quantidade
        lotes_validos.append((lote, item.quantidade))

    pedido = Pedido(
        participante_id=participante.id,
        evento_id=evento.id,
        valor_total=valor_total,
        valor_desconto=0.0,
    )
    db.add(pedido)
    await db.flush()

    for lote, qtd in lotes_validos:
        db.add(
            PedidoItem(
                pedido_id=pedido.id,
                lote_id=lote.id,
                quantidade=qtd,
                preco_unitario=float(lote.preco),
            )
        )
        lote_repo.incrementar_vendidas(lote, qtd)

    await db.commit()
    await db.refresh(pedido)

    try:
        cobranca = await pagamento_service.criar_pagamento(
            db,
            pedido=pedido,
            metodo=data.metodo,
            customer_id=participante.asaas_customer_id,
        )
    except AsaasAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Pedido criado, mas falha ao gerar cobrança no gateway: {e}",
        )

    pedido_com_itens = await pedido_repo.get_by_id_com_itens(db, pedido.id)

    return {
        "pedido": pedido_com_itens,
        "invoice_url": cobranca.get("invoiceUrl", ""),
        "charge_id": cobranca.get("id", ""),
    }


async def obter(
    db: AsyncSession, usuario: Usuario, pedido_id: uuid.UUID
) -> Pedido:
    pedido = await pedido_repo.get_by_id_com_itens(db, pedido_id)
    if pedido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado.",
        )
    if pedido.participante_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a este pedido.",
        )
    return pedido


async def listar_meus(db: AsyncSession, participante: Usuario) -> list[Pedido]:
    return await pedido_repo.list_by_participante(db, participante.id)


async def cancelar(
    db: AsyncSession, participante: Usuario, pedido_id: uuid.UUID
) -> Pedido:
    pedido = await pedido_repo.get_by_id_com_itens(db, pedido_id)
    if pedido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado.",
        )
    if pedido.participante_id != participante.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a este pedido.",
        )
    if pedido.status != StatusPedido.PENDENTE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Apenas pedidos pendentes podem ser cancelados.",
        )

    for item in pedido.itens:
        lote = await lote_repo.get_by_id(db, item.lote_id)
        if lote is not None:
            lote_repo.decrementar_vendidas(lote, item.quantidade)

    pagamento = await pagamento_repo.get_by_pedido_id(db, pedido.id)
    if pagamento is not None:
        if pagamento.charge_id is not None:
            try:
                await asaas_charges.delete_charge(charge_id=pagamento.charge_id)
            except AsaasAPIError:
                pass
        await pagamento_repo.update_status(db, pagamento, StatusPagamento.CANCELADO)

    return await pedido_repo.update_status(db, pedido, StatusPedido.CANCELADO)
