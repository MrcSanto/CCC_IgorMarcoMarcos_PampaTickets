import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usuario import PerfilUsuario, Usuario


async def get_by_email(db: AsyncSession, email: str) -> Usuario | None:
    result = await db.execute(select(Usuario).where(Usuario.email == email))
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, usuario_id: uuid.UUID) -> Usuario | None:
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    return result.scalar_one_or_none()


async def get_by_cpf_cnpj(db: AsyncSession, cpf_cnpj: str) -> Usuario | None:
    result = await db.execute(select(Usuario).where(Usuario.cpf_cnpj == cpf_cnpj))
    return result.scalar_one_or_none()


async def create(
    db: AsyncSession,
    nome: str,
    celular: str,
    cpf_cnpj: str,
    email: str,
    senha_hash: str,
    perfil: PerfilUsuario,
    asaas_customer_id: str | None = None,
    id: uuid.UUID | None = None,
) -> Usuario:
    usuario = Usuario(
        id=id or uuid.uuid4(),
        nome=nome,
        email=email,
        senha_hash=senha_hash,
        perfil=perfil,
        celular=celular,
        cpf_cnpj=cpf_cnpj,
        asaas_customer_id=asaas_customer_id,
    )
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    return usuario
