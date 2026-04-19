import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.usuario import PerfilUsuario


class CadastroRequest(BaseModel):
    nome: str = Field(..., min_length=2, max_length=255, examples=["João da Silva"])
    email: EmailStr = Field(..., examples=["joao@email.com"])
    cpf_cnpj: str = Field(..., examples=["924.177.770-29"])
    celular: str = Field(..., examples=["51987654321"])
    senha: str = Field(..., min_length=8, max_length=72, examples=["senha1234"])
    perfil: PerfilUsuario = Field(..., examples=["PARTICIPANTE"])

    @field_validator("celular")
    @classmethod
    def validar_celular(cls, v: str) -> str:
        numero = re.sub(r"\D", "", v)
        if not re.fullmatch(r"[1-9]{2}9\d{8}", numero):
            raise ValueError(
                "Celular inválido. Informe DDD + 9 dígitos (ex: 51987654321)."
            )
        return numero


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["joao@email.com"])
    senha: str = Field(..., examples=["senha1234"])


class UsuarioResponse(BaseModel):
    id: uuid.UUID = Field(..., examples=["550e8400-e29b-41d4-a716-446655440000"])
    nome: str = Field(..., examples=["João da Silva"])
    email: str = Field(..., examples=["joao@email.com"])
    cpf_cnpj: str = Field(..., examples=["924.177.770-29"])
    celular: str = Field(..., examples=["51987654321"])
    perfil: PerfilUsuario = Field(..., examples=["PARTICIPANTE"])
    ativo: bool = Field(..., examples=[True])
    criado_em: datetime = Field(..., examples=["2026-04-04T10:00:00"])

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str = Field(..., examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."])
    token_type: str = Field(default="bearer", examples=["bearer"])
    usuario: UsuarioResponse
