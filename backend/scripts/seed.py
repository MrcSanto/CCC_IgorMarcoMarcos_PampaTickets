"""
Seed de dados para desenvolvimento. Idempotente — se o email já existe, pula.

Uso: make seed
"""
import asyncio

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.usuario import PerfilUsuario, Usuario
from app.service.auth_service import _hash_senha


SEED_USERS = [
    {
        "nome": "Organizador Teste",
        "email": "organizador@test.com",
        "cpf_cnpj": "11144477735",
        "celular": "51999999999",
        "senha": "Teste123!",
        "perfil": PerfilUsuario.ORGANIZADOR,
    },
    {
        "nome": "Participante Teste",
        "email": "participante@test.com",
        "cpf_cnpj": "12345678909",
        "celular": "51988888888",
        "senha": "Teste123!",
        "perfil": PerfilUsuario.PARTICIPANTE,
    },
]


async def main() -> None:
    async with SessionLocal() as db:
        for data in SEED_USERS:
            result = await db.execute(
                select(Usuario).where(Usuario.email == data["email"])
            )
            if result.scalar_one_or_none() is not None:
                print(f"[skip] {data['email']} já existe")
                continue

            usuario = Usuario(
                nome=data["nome"],
                email=data["email"],
                cpf_cnpj=data["cpf_cnpj"],
                celular=data["celular"],
                senha_hash=_hash_senha(data["senha"]),
                perfil=data["perfil"],
                ativo=True,
            )
            db.add(usuario)
            await db.commit()
            print(f"[ok] criado {data['email']} ({data['perfil'].value})")


if __name__ == "__main__":
    asyncio.run(main())
