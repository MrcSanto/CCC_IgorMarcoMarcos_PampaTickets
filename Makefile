.PHONY: help install dev db-up db-stop db-down build run migrate migrate-down migrate-history test lint format

BACKEND_DIR := backend

help:
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "  Desenvolvimento"
	@echo "  ---------------"
	@echo "  install          Instala dependências do backend"
	@echo "  dev              Inicia o servidor de desenvolvimento (com reload)"
	@echo ""
	@echo "  Banco de Dados"
	@echo "  --------------"
	@echo "  db-up            Sobe o PostgreSQL via Docker Compose"
	@echo "  db-stop          Para o PostgreSQL (mantém os dados)"
	@echo "  db-down          Remove o PostgreSQL e o volume de dados"
	@echo ""
	@echo "  Migrações"
	@echo "  ---------"
	@echo "  migrate          Aplica todas as migrações pendentes"
	@echo "  migrate-down     Reverte a última migração"
	@echo "  migrate-history  Exibe o histórico de migrações"
	@echo "  migration m=msg  Cria uma nova migração (ex: make migration m='add tabela usuarios')"
	@echo ""
	@echo "  Docker"
	@echo "  ------"
	@echo "  build            Constrói a imagem Docker do backend"
	@echo "  run              Sobe o banco + backend via Docker Compose"
	@echo ""
	@echo "  Qualidade"
	@echo "  ---------"
	@echo "  test             Executa os testes com pytest"
	@echo "  lint             Verifica o código com ruff"
	@echo "  format           Formata o código com ruff"

# --- Desenvolvimento ---

install:
	cd $(BACKEND_DIR) && uv sync

dev: db-up
	cd $(BACKEND_DIR) && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# --- Banco de Dados ---

db-up:
	docker compose up -d db

db-stop:
	docker compose stop db

db-down:
	docker compose down -v

# --- Migrações ---

migrate:
	cd $(BACKEND_DIR) && uv run alembic upgrade head

migrate-down:
	cd $(BACKEND_DIR) && uv run alembic downgrade -1

migrate-history:
	cd $(BACKEND_DIR) && uv run alembic history --verbose

migration:
ifndef m
	$(error Informe a mensagem da migração: make migration m="sua mensagem")
endif
	cd $(BACKEND_DIR) && uv run alembic revision --autogenerate -m "$(m)"

# --- Docker ---

build:
	docker build -t pampatickets-backend ./$(BACKEND_DIR)

run: db-up
	docker compose up --build

# --- Qualidade ---

test:
	cd $(BACKEND_DIR) && uv run pytest -v

lint:
	cd $(BACKEND_DIR) && uv run ruff check .

format:
	cd $(BACKEND_DIR) && uv run ruff format .