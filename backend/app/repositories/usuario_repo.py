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


async def create(
    db: AsyncSession,
    nome: str,
    celular: str,
    email: str,
    senha_hash: str,
    perfil: PerfilUsuario,
) -> Usuario:
    usuario = Usuario(
        nome=nome, email=email, senha_hash=senha_hash, perfil=perfil, celular=celular
    )
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    return usuario
