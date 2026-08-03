import logging
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("app.middleware.logging")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_host = request.client.host if request.client else "unknown"
        
        logger.info(f"Request started: {request.method} {request.url.path} from {client_host}")
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"Request completed: {request.method} {request.url.path} - "
            f"Status: {response.status_code} - Duration: {process_time:.2f}ms"
        )
        
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        return response
