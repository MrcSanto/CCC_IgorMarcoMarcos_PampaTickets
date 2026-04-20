# project.md — Visão Geral do Projeto

## O que é o pampatickets

Plataforma digital de gerenciamento de eventos e venda de ingressos online, desenvolvida como projeto acadêmico na Universidade de Passo Fundo (UPF). Inspirada no Sympla, com identidade regional do Rio Grande do Sul.

Este repositório contém o **backend principal**, responsável por toda a lógica de negócio, autenticação e persistência de dados.

---

## Stack Técnica

| Responsabilidade | Tecnologia |
|---|---|
| Linguagem | Python |
| Framework | FastAPI |
| ORM | SQLAlchemy |
| Migrações | Alembic |
| Banco de dados | PostgreSQL |
| Autenticação | JWT via PyJWT — perfis: Organizador / Participante |
| Geração de PDF | ReportLab, assíncrono via `asyncio` |
| Armazenamento de arquivos | Supabase Storage |
| Gateway de pagamento | Asaas (sandbox para testes) |
| Notificações | Meta Cloud API — WhatsApp Business |
| Documentação de API | Swagger UI (nativa do FastAPI) |
| Gerenciamento de pacotes | uv |
| Testes | Pytest + HTTPX |

---

## Estrutura de Pastas

```
pampatickets/
├── docs/                              # Documentação do projeto para o Claude Code
│   ├── project.md
│   ├── requirements.md
│   ├── roadmap.md
│   └── state.md
├── app/
│   ├── api/
│   │   ├── middlewares/
│   │   │   ├── __init__.py
│   │   │   └── request_id.py          # Middleware de rastreamento de requisições
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # Endpoints de autenticação e cadastro
│   │   │   ├── eventos.py             # Endpoints de criação e gerenciamento de eventos
│   │   │   ├── ingressos.py           # Endpoints de lotes e ingressos
│   │   │   ├── pedidos.py             # Endpoints de pedidos e compras
│   │   │   ├── cupons.py              # Endpoints de cupons de desconto
│   │   │   ├── cortesias.py           # Endpoints de ingressos cortesia
│   │   │   ├── checkin.py             # Endpoints de check-in via QR Code
│   │   │   ├── relatorios.py          # Endpoints de relatórios PDF
│   │   │   ├── webhooks.py            # Endpoint receptor de webhooks do Asaas
│   │   │   └── galeria.py             # Galeria de fotos — baixa prioridade
│   │   ├── __init__.py
│   │   └── deps.py                    # Dependências compartilhadas (get_db, get_current_user)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                  # Configurações via variáveis de ambiente
│   │   ├── logging_config.py          # Configuração de logs estruturados
│   │   ├── logging_context.py         # Contexto de logging por requisição
│   │   └── scheduler_utils.py         # Utilitários para tarefas agendadas
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py                    # Base declarativa do SQLAlchemy + import dos models
│   │   └── session.py                 # Engine e SessionLocal
│   ├── models/
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   ├── evento.py
│   │   ├── lote.py
│   │   ├── ingresso.py
│   │   ├── pedido.py
│   │   ├── pagamento.py
│   │   ├── cupom.py
│   │   ├── cortesia.py
│   │   ├── checkin.py
│   │   ├── certificado.py
│   │   └── foto.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base_repo.py               # CRUD genérico reutilizável
│   │   ├── usuario_repo.py
│   │   ├── evento_repo.py
│   │   ├── lote_repo.py
│   │   ├── ingresso_repo.py
│   │   ├── pedido_repo.py
│   │   ├── cupom_repo.py
│   │   ├── cortesia_repo.py
│   │   ├── checkin_repo.py
│   │   ├── certificado_repo.py
│   │   └── foto_repo.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   ├── evento.py
│   │   ├── lote.py
│   │   ├── ingresso.py
│   │   ├── pedido.py
│   │   ├── pagamento.py
│   │   ├── cupom.py
│   │   ├── cortesia.py
│   │   ├── checkin.py
│   │   ├── certificado.py
│   │   └── foto.py
│   ├── service/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── evento_service.py
│   │   ├── ingresso_service.py
│   │   ├── pedido_service.py
│   │   ├── pagamento_service.py       # Orquestra fluxo de cobrança (usa integrations/asaas)
│   │   ├── webhook_service.py         # Processa webhooks do Asaas
│   │   ├── whatsapp_service.py        # Orquestra notificações (usa integrations/whatsapp)
│   │   ├── cupom_service.py
│   │   ├── cortesia_service.py
│   │   ├── checkin_service.py
│   │   ├── relatorio_service.py       # Coordena geração assíncrona de PDFs
│   │   └── galeria_service.py         # Baixa prioridade
│   ├── integrations/                  # Clientes HTTP de APIs externas — sem regra de negócio
│   │   ├── __init__.py
│   │   ├── asaas/
│   │   │   ├── __init__.py
│   │   │   ├── client.py              # httpx.AsyncClient + auth/timeout
│   │   │   ├── customers.py           # create_customer, get_customer
│   │   │   ├── payments.py            # create_payment, refund_payment
│   │   │   ├── exceptions.py          # AsaasAPIError
│   │   │   └── schemas.py             # DTOs Pydantic do Asaas
│   │   ├── supabase/
│   │   │   ├── __init__.py
│   │   │   └── storage.py             # upload/download e URLs assinadas
│   │   └── whatsapp/
│   │       ├── __init__.py
│   │       └── meta.py                # envio de mensagens via Meta Cloud API
│   ├── reports/
│   │   ├── __init__.py
│   │   ├── ingresso_pdf.py            # UC12
│   │   ├── certificado_pdf.py         # UC13
│   │   └── relatorio_financeiro_pdf.py # UC14
│   ├── __init__.py
│   └── main.py
├── tests/                             # Espelha a estrutura de app/
│   └── service/
│       └── test_evento_service.py
├── .env                               # Nunca commitar
├── .env.example
├── pyproject.toml
├── uv.lock
└── CLAUDE.md
```

---

## Variáveis de Ambiente

Referência completa em `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pampatickets
SECRET_KEY=sua-chave-secreta-jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Supabase Storage
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_KEY=sua-service-role-key
SUPABASE_BUCKET_INGRESSOS=ingressos
SUPABASE_BUCKET_CERTIFICADOS=certificados
SUPABASE_BUCKET_RELATORIOS=relatorios

# Asaas
ASAAS_API_KEY=sua-api-key-asaas
ASAAS_BASE_URL_UAT=https://sandbox.asaas.com/api/v3
ASAAS_WEBHOOK_TOKEN=token-para-validar-webhooks

# Meta Cloud API — WhatsApp Business
META_WHATSAPP_TOKEN=seu-token-de-acesso
META_PHONE_NUMBER_ID=id-do-numero-whatsapp
META_VERIFY_TOKEN=token-de-verificacao-webhook
```

---

## Como Rodar

```bash
# Instalar o uv
curl -Ls https://astral.sh/uv/install.sh | sh

# Instalar dependências
uv sync

# Aplicar migrações
uv run alembic upgrade head

# Iniciar servidor de desenvolvimento
uv run uvicorn app.main:app --reload

# Rodar testes
uv run pytest
```