import httpx

from app.core.config import settings

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.ASAAS_BASE_URL_UAT,
            headers={
                "accept": "application/json",
                "content-type": "application/json",
                "access_token": settings.ASAAS_API_KEY,
            },
            timeout=30.0,
        )
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
