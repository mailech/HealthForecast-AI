import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.database import engine
from app.db.base import Base
from app.models import user, patient, prediction, recommendation, treatment, appointment
from app.core.security import decode_access_token
from fastapi import Request

# Routers
from app.routers import (
    auth,
    users,
    patients,
    prediction,
    treatment,
    clinical,
    analytics,
    ml_models,
    appointments,
    reports,
)

# Logging Setup
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("healthforecast_ai")


# --- Lifespan Manager (Database Table Creation) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # App startup logic: Database tables initialize cheyadaniki
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully.")
    yield
    # App shutdown logic (kavali anukunte un-comment cheyochu):
    # await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS Configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Lightweight auth middleware: decode token (if present) and attach payload to request.state
@app.middleware("http")
async def attach_token_payload(request: Request, call_next):
    auth_header = request.headers.get("Authorization")
    request.state.token_payload = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = decode_access_token(token)
            request.state.token_payload = payload
        except Exception:
            request.state.token_payload = None
    response = await call_next(request)
    return response


# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error. Please contact backend admin."},
    )


# Health Check
@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# Include all sub-routers directly with prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(prediction.router, prefix=settings.API_V1_STR)
app.include_router(treatment.router, prefix=settings.API_V1_STR)
app.include_router(clinical.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(ml_models.router, prefix=settings.API_V1_STR)
app.include_router(appointments.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)