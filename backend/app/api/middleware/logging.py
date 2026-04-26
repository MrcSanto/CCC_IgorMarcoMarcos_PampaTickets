import time
import uuid

from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start) * 1000, 1)
        client_ip = request.client.host if request.client else "-"

        logger.info(
            f"{request.method} {request.url.path} → {response.status_code} | "
            f"{duration_ms}ms | ip={client_ip} | id={request_id}"
        )

        return response
