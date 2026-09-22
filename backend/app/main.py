import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import settings
from app.db.database import engine
from app.db.base import Base

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
    notifications,
    search,
)

# Logging Setup
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("healthforecast_ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    import app.db.database as db_mod
    from sqlalchemy import text
    try:
        async with db_mod.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            # Safe column migration check for existing tables
            try:
                await conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS diagnosis VARCHAR(255);"))
                await conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS department VARCHAR(100);"))
                await conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS admission_date DATE;"))
                await conn.execute(text("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS prior_admissions INTEGER;"))
                await conn.execute(text("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS length_of_stay INTEGER;"))
                await conn.execute(text("UPDATE patients SET last_name = '' WHERE LOWER(TRIM(first_name)) = LOWER(TRIM(last_name));"))
            except Exception as mig_err:
                logger.info(f"Schema migration check note: {mig_err}")
        logger.info("Database tables initialized successfully with primary engine.")
    except Exception as exc:
        logger.warning(f"Primary PostgreSQL database connection failed ({exc}). Falling back to SQLite...")
        sqlite_engine = create_async_engine("sqlite+aiosqlite:///./healthforecast.db", echo=settings.DEBUG, future=True)
        db_mod.engine = sqlite_engine
        db_mod.AsyncSessionLocal = async_sessionmaker(
            bind=sqlite_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
        async with sqlite_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            try:
                await conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS diagnosis VARCHAR(255);"))
                await conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS department VARCHAR(100);"))
                await conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS admission_date DATE;"))
                await conn.execute(text("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS prior_admissions INTEGER;"))
                await conn.execute(text("ALTER TABLE predictions ADD COLUMN IF NOT EXISTS length_of_stay INTEGER;"))
            except Exception:
                pass
        logger.info("SQLite database tables initialized successfully.")

    # Seed default role accounts if missing
    try:
        from app.models.user import User, UserRole
        from app.core.security import get_password_hash
        from sqlalchemy import select

        async with db_mod.AsyncSessionLocal() as session:
            seed_accounts = [
                ("sarah@hospital.com", "Dr. Sarah Mitchell", UserRole.DOCTOR, "password"),
                ("admin@hospital.com", "Hospital Admin", UserRole.HOSPITAL_ADMIN, "password"),
                ("researcher@hospital.com", "Healthcare Researcher", UserRole.RESEARCHER, "password"),
                ("sysadmin@hospital.com", "System Administrator", UserRole.SYSTEM_ADMIN, "password"),
            ]
            for email, name, role, pw in seed_accounts:
                existing = await session.scalar(select(User).where(User.email == email))
                if not existing:
                    user_obj = User(
                        email=email,
                        full_name=name,
                        role=role,
                        password_hash=get_password_hash(pw),
                        is_active=True,
                    )
                    session.add(user_obj)
                elif not existing.is_active:
                    existing.is_active = True
            await session.commit()
            logger.info("Default role accounts verified.")
    except Exception as e:
        logger.warning(f"Default role accounts seed check skipped: {e}")

    yield


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
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
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


# Exception Handler with CORS headers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {exc}", exc_info=True)
    resp = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )
    origin = request.headers.get("origin")
    if origin:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Access-Control-Allow-Credentials"] = "true"
    return resp


# Health Check
@app.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=settings.PORT,
        reload=False,
    )


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
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)