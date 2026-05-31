import uuid

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.api.deps import DbDep, OrganizadorUser
from app.schemas.relatorio import RelatorioResumoResponse
from app.service import relatorio_service

router = APIRouter(tags=["Relatórios"])


@router.get(
    "/organizador/eventos/{evento_id}/relatorio/resumo",
    response_model=RelatorioResumoResponse,
    summary="Resumo financeiro do evento em JSON (para o dashboard)",
)
async def resumo_relatorio(
    evento_id: uuid.UUID,
    db: DbDep,
    organizador: OrganizadorUser,
) -> RelatorioResumoResponse:
    dados = await relatorio_service.montar_dados(db, organizador, evento_id)
    return RelatorioResumoResponse.from_dados(dados)


@router.get(
    "/organizador/eventos/{evento_id}/relatorio",
    summary="Gera e baixa o relatório financeiro do evento em PDF",
)
async def baixar_relatorio(
    evento_id: uuid.UUID,
    db: DbDep,
    organizador: OrganizadorUser,
) -> StreamingResponse:
    buffer = await relatorio_service.gerar_relatorio(db, organizador, evento_id)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=relatorio_{evento_id}.pdf"
        },
    )
