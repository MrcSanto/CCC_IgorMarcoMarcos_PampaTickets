FROM python:3.12-slim

# Instala o uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copia arquivos de dependências e instala sem o grupo dev
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Copia o código da aplicação
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Garante que o PATH inclui os binários do venv
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]