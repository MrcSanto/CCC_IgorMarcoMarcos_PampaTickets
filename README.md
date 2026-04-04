# PampaTickets

Plataforma digital de gerenciamento de eventos e venda de ingressos online, desenvolvida como projeto acadêmico na Universidade de Passo Fundo (UPF). Inspirada no Sympla, com identidade regional do Rio Grande do Sul.

## Stack

- **Backend:** Python, FastAPI, SQLAlchemy, Alembic
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT
- **Pagamentos:** Asaas (Pix, boleto, cartão de crédito)
- **Armazenamento:** Supabase Storage (PDFs)
- **Notificações:** WhatsApp via Meta Cloud API
- **Gerenciamento de pacotes:** uv

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [uv](https://github.com/astral-sh/uv)

## Como rodar

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd pampatickets

# 2. Configure as variáveis de ambiente
cp .env.example ./.env
# edite .env com suas credenciais

# 3. Build da imagem
make build

# 4. Inicia os serviços 
make up
```

A API estará disponível em `http://localhost:8000` e a documentação em `http://localhost:8000/docs`.

## Comandos úteis

| Comando | Descrição |
|---|---|
| `make build` | Builda a imagem da API |
| `make up` | Sobe todos os serviços em background | 
| `make rebuild` | Restarta os containeres |
| `make down` | Para e remove os containers | 
| `make migrate` | Aplica migrações pendentes |
| `make migration m="mensagem"` | Cria uma nova migração |
| `make test` | Executa os testes |
| `make lint` | Verifica o código com ruff |

> Para ver todos os comandos disponíveis: `make help`