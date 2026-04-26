import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.integrations.asaas import customers as asaas_customers
from app.integrations.asaas.exceptions import AsaasAPIError
from app.models.usuario import Usuario
from app.repositories import usuario_repo
from app.schemas.usuario import CadastroRequest, LoginRequest


def _hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha[:72].encode(), bcrypt.gensalt()).decode()


def _verificar_senha(senha: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha[:72].encode(), senha_hash.encode())


def _gerar_token(usuario_id: str) -> str:
    expiracao = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": usuario_id, "exp": expiracao}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def cadastrar(db: AsyncSession, data: CadastroRequest) -> Usuario:
    if await usuario_repo.get_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado.",
        )

    if await usuario_repo.get_by_cpf_cnpj(db, data.cpf_cnpj):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="CPF/CNPJ já cadastrado.",
        )

    usuario_id = uuid.uuid4()
    try:
        customer = await asaas_customers.create_customer(
            nome=data.nome,
            cpf_cnpj=data.cpf_cnpj,
            email=data.email,
            celular=data.celular,
            usuario_id=usuario_id,
        )
    except AsaasAPIError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Falha ao registrar cliente no gateway de pagamento.",
        )

    return await usuario_repo.create(
        db,
        id=usuario_id,
        nome=data.nome,
        celular=data.celular,
        email=data.email,
        cpf_cnpj=data.cpf_cnpj,
        senha_hash=_hash_senha(data.senha),
        perfil=data.perfil,
        asaas_customer_id=customer["id"],
    )


async def login(db: AsyncSession, data: LoginRequest) -> tuple[str, Usuario]:
    usuario = await usuario_repo.get_by_email(db, data.email)

    if not usuario or not _verificar_senha(data.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos.",
        )

    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta desativada.",
        )

    token = _gerar_token(str(usuario.id))
    return token, usuario
