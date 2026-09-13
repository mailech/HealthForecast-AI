import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """
    Sliding-window IP-based rate limiter dependency to mitigate brute-force
    and denial-of-service attacks on sensitive authentication endpoints.
    """
    def __init__(self, requests_limit: int = 10, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.requests_log = defaultdict(list)

    def __call__(self, request: Request):
        # Resolve client IP (supporting X-Forwarded-For if behind proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
        
        current_time = time.time()
        window_start = current_time - self.window_seconds
        
        # Purge older timestamps
        self.requests_log[client_ip] = [
            t for t in self.requests_log[client_ip] if t > window_start
        ]
        
        if len(self.requests_log[client_ip]) >= self.requests_limit:
            retry_after = int(self.window_seconds - (current_time - self.requests_log[client_ip][0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.requests_limit} requests per {self.window_seconds}s. Please retry in {max(1, retry_after)} seconds.",
                headers={"Retry-After": str(max(1, retry_after))}
            )
            
        self.requests_log[client_ip].append(current_time)
        return True

# Standard rate limiters
auth_rate_limiter = InMemoryRateLimiter(requests_limit=15, window_seconds=60)
retrain_rate_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=300)
