from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from fastapi import FastAPI

from app.api.routes import auth, eventos, lotes, pagamentos
from app.db.session import init_db
from app.integrations.asaas.client import close_client as close_asaas_client


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, Any]:
    await init_db()
    yield
    await close_asaas_client()


app = FastAPI(
    title="PampaTickets API",
    lifespan=lifespan,
)

app.include_router(auth.router, prefix="/api")
app.include_router(eventos.router, prefix="/api")
app.include_router(lotes.router, prefix="/api")
# app.include_router(pagamentos.router, prefix="/api")  # TODO: remover após testes


@app.get("/", tags=["Health Check"])
def read_root() -> dict[str, str]:
    return {"status": "ok", "service": "PampaTickets Core API"}
