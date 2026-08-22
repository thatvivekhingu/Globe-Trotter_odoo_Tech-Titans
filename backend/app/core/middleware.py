"""Enterprise request correlation, execution time, and security headers middleware."""
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import logger


class ProcessTimeAndCorrelationMiddleware(BaseHTTPMiddleware):
    """Add correlation request ID (X-Request-ID) and processing duration (X-Process-Time)."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{duration_ms:.2f}ms"

        # Log incoming HTTP requests cleanly
        if not request.url.path.startswith("/health"):
            logger.info(
                f"{request.method} {request.url.path} -> Status {response.status_code} ({duration_ms:.2f}ms) [ID: {request_id[:8]}]"
            )

        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Apply production HTTP security response headers."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response
