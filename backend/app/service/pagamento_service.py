from datetime import datetime, timezone

from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.asaas import charges as asaas_charges
from app.models.ingresso import StatusIngresso
from app.models.pagamento import MetodoPagamento, Pagamento, Reembolso, StatusPagamento
from app.models.pedido import Pedido, StatusPedido
from app.repositories import (
    ingresso_repo,
    pagamento_repo,
    pedido_repo,
    reembolso_repo,
)
from app.service import cancelamento_service, ingresso_service
from app.service.ingresso_service import gerar_pdf_ingresso_upload


async def criar_pagamento(
    db: AsyncSession,
    *,
    pedido: Pedido,
    metodo: MetodoPagamento,
    customer_id: str,
) -> dict:
    """
    Cria o registro de pagamento no banco e a cobrança no Asaas.
    Retorna o dict da cobrança do Asaas (contém o link/QR Code).
    """
    pagamento = await pagamento_repo.create(
        db,
        pedido_id=pedido.id,
        metodo=metodo,
        valor=float(pedido.valor_total),
    )

    cobranca = await asaas_charges.create_charge(
        customer_id=customer_id,
        billing_type=metodo.value,
        value=float(pedido.valor_total),
        due_date=datetime.now(timezone.utc).date(),
        external_reference=str(pedido.id),
    )

    await pagamento_repo.update_charge_id(db, pagamento, cobranca["id"])

    return cobranca


async def obter_pix_qrcode(charge_id: str) -> dict:
    return await asaas_charges.get_pix_qrcode(charge_id=charge_id)


async def solicitar_reembolso(
    db: AsyncSession, *, pagamento: Pagamento, motivo: str | None
) -> Reembolso:
    """
    Solicita reembolso ao Asaas e registra o Reembolso no banco.
    Não atualiza status do pedido/pagamento — isso ocorre quando o webhook
    PAYMENT_REFUNDED confirmar a operação.
    """
    if pagamento.charge_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pagamento sem cobrança no gateway.",
        )

    await asaas_charges.refund_charge(charge_id=pagamento.charge_id)

    return await reembolso_repo.create(
        db,
        pagamento_id=pagamento.id,
        valor=float(pagamento.valor),
        motivo=motivo,
    )


async def processar_webhook(db: AsyncSession, *, evento: str, payment_id: str) -> None:
    """
    Processa eventos recebidos do Asaas e atualiza o banco.
    Deve ser chamado pelo webhook_service após validar o token.
    """
    pagamento = await pagamento_repo.get_by_charge_id(db, payment_id)
    if pagamento is None:
        return

    if evento in ("PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"):
        if pagamento.status == StatusPagamento.APROVADO:
            logger.info(
                "{} ignorado — pagamento {} já aprovado",
                evento,
                payment_id,
            )
            return

        await pagamento_repo.update_status(
            db,
            pagamento,
            StatusPagamento.APROVADO,
            pago_em=datetime.now(timezone.utc),
        )
        await _atualizar_status_pedido(db, pagamento.pedido_id, StatusPedido.PAGO)

        await ingresso_service.criar_ingressos_para_pedido(db, pagamento.pedido_id)
        await _gerar_pdfs_ingressos(db, pagamento.pedido_id)

    elif evento == "PAYMENT_OVERDUE":
        pedido = await pedido_repo.get_by_id_com_itens(db, pagamento.pedido_id)
        if pedido is not None:
            await cancelamento_service.aplicar_cancelamento(
                db,
                pedido=pedido,
                motivo_status_pagamento=StatusPagamento.RECUSADO,
            )

    elif evento == "PAYMENT_REFUNDED":
        if pagamento.status == StatusPagamento.ESTORNADO:
            logger.info(
                "PAYMENT_REFUNDED ignorado — pagamento {} já estornado", payment_id
            )
            return

        await pagamento_repo.update_status(db, pagamento, StatusPagamento.ESTORNADO)
        await _atualizar_status_pedido(
            db, pagamento.pedido_id, StatusPedido.REEMBOLSADO
        )

        ingressos = await ingresso_repo.get_by_pedido_id(db, pagamento.pedido_id)
        for ing in ingressos:
            await ingresso_repo.update_status(db, ing.id, StatusIngresso.CANCELADO)

        reembolso = await reembolso_repo.get_by_pagamento_id(db, pagamento.id)
        if reembolso is not None and reembolso.processado_em is None:
            await reembolso_repo.marcar_processado(db, reembolso)

    elif evento == "PAYMENT_CREATED":
        logger.info(
            "PAYMENT_CREATED ignorado — cobrança {} já registrada no fluxo síncrono",
            payment_id,
        )


async def _atualizar_status_pedido(
    db: AsyncSession, pedido_id, novo_status: StatusPedido
) -> None:
    result = await db.get(Pedido, pedido_id)
    if result is not None:
        result.status = novo_status
        await db.commit()


async def _gerar_pdfs_ingressos(db: AsyncSession, pedido_id: str) -> None:
    """
    Gera PDFs para todos os ingressos de um pedido pago.
    """
    try:
        # Buscar ingressos do pedido
        ingressos = await ingresso_repo.get_by_pedido_id(db, pedido_id)

        # Gerar PDF para cada ingresso
        for ingresso in ingressos:
            await gerar_pdf_ingresso_upload(db, str(ingresso.id))

    except Exception:
        logger.exception("Falha ao gerar PDFs dos ingressos do pedido {}", pedido_id)
