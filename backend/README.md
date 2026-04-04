# PampaTickets — Backend

API REST do sistema de gerenciamento de eventos e venda de ingressos, desenvolvida com FastAPI.

## Stack

- **Python 3.12** com [uv](https://github.com/astral-sh/uv) para gerenciamento de pacotes
- **FastAPI** — framework web
- **SQLAlchemy 2.0** — ORM assíncrono
- **Alembic** — migrações de banco de dados
- **PostgreSQL** — banco de dados relacional
- **JWT (PyJWT)** — autenticação
- **bcrypt** — hash de senhas
- **Asaas** — gateway de pagamento (Pix, boleto, cartão)
- **Supabase Storage** — armazenamento de PDFs
- **Meta Cloud API** — notificações via WhatsApp

## Pré-requisitos

- Python 3.12+
- [uv](https://github.com/astral-sh/uv)
- Docker e Docker Compose

## Variáveis de ambiente

Copie o `.env.example` na raiz do projeto e preencha os valores:

```bash
cp ../.env.example ../.env
```

| Variável | Descrição |
|---|---|
| `ASYNC_DATABASE_URL` | URL de conexão com o PostgreSQL |
| `SECRET_KEY` | Chave secreta para assinar os tokens JWT (mín. 32 bytes) |
| `ALGORITHM` | Algoritmo JWT (padrão: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tempo de expiração do token em minutos |

> Para gerar uma `SECRET_KEY` segura: `python3 -c "import secrets; print(secrets.token_hex(32))"`

## Desenvolvimento local

```bash
# Na raiz do projeto
make install   # instala dependências
make migrate   # aplica migrações
make dev       # inicia o servidor com hot-reload
```

A API estará disponível em `http://localhost:8000`.
Documentação interativa (Swagger): `http://localhost:8000/docs`.

## Migrações

```bash
make migration m="descrição da alteração"  # cria nova migração
make migrate                                # aplica migrações pendentes
make migrate-down                           # reverte a última migração
make migrate-history                        # histórico de migrações
```
