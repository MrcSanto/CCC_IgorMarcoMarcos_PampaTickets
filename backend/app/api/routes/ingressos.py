import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ParticipanteUser
from app.db.session import get_db
from app.repositories import ingresso_repo
from app.schemas.ingresso import IngressoResponse

router = APIRouter(tags=["Ingressos"])


@router.get("/ingressos/meus", response_model=list[IngressoResponse])
async def listar_meus_ingressos(
    participante: ParticipanteUser,
    db: AsyncSession = Depends(get_db),
) -> list[IngressoResponse]:
    ingressos = await ingresso_repo.list_by_participante(db, participante.id)
    return [IngressoResponse.from_ingresso(i) for i in ingressos]


@router.get("/ingressos/{ingresso_id}", response_model=IngressoResponse)
async def obter_ingresso(
    ingresso_id: uuid.UUID,
    participante: ParticipanteUser,
    db: AsyncSession = Depends(get_db),
) -> IngressoResponse:
    ingresso = await ingresso_repo.get_with_relations(db, str(ingresso_id))
    if ingresso is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingresso não encontrado.",
        )
    if ingresso.participante_id != participante.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a este ingresso.",
        )
    return IngressoResponse.from_ingresso(ingresso)
