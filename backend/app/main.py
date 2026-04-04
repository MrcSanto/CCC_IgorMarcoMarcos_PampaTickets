from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from fastapi import FastAPI

from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, Any]:
    await init_db()
    yield


app = FastAPI(
    title="PampaTickets API",
    lifespan=lifespan,
)


@app.get("/", tags=["Health Check"])
def read_root() -> dict[str, str]:
    return {"status": "ok", "service": "PampaTickets Core API"}
