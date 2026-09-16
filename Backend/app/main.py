from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, client, users_collection
from app.ai.model_loader import warm_up_model
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.utils.security import get_password_hash

from app.routes import auth, users, patients, history, prediction, treatments, dashboard, reports, upload, audit

DEMO_USERS = [
    {
        "email": "doctor@hospital.com",
        "full_name": "Dr. Sarah Connor",
        "role": "Doctor",
        "hospital": "General Hospital",
        "password": "Password123",
    },
    {
        "email": "researcher@hospital.com",
        "full_name": "Dr. Miles Dyson",
        "role": "Researcher",
        "hospital": "Cyberdyne Lab",
        "password": "Password123",
    },
    {
        "email": "admin@hospital.com",
        "full_name": "Admin Officer John Connor",
        "role": "Admin",
        "hospital": "General Hospital",
        "password": "Password123",
    },
    {
        "email": "sysadmin@hospital.com",
        "full_name": "System Administrator",
        "role": "SysAdmin",
        "hospital": "IT Headquarters",
        "password": "Password123",
    },
]

def ensure_demo_users():
    """
    Ensures standard 4 demo accounts exist in MongoDB with password 'Password123' and active status.
    """
    for u in DEMO_USERS:
        users_collection.update_one(
            {"email": u["email"]},
            {"$set": {
                "email": u["email"],
                "full_name": u["full_name"],
                "role": u["role"],
                "hospital": u["hospital"],
                "hashed_password": get_password_hash(u["password"]),
                "is_active": True,
                "must_change_password": False,
            }},
            upsert=True
        )

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    ensure_demo_users()
    warm_up_model()
    yield
    client.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Starlette processes middleware in reverse registration order.
# CORSMiddleware must be added LAST so it executes FIRST (outermost layer).
app.add_middleware(LoggingMiddleware)
app.add_middleware(ErrorHandlerMiddleware)
cors_origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],
    allow_credentials=True if cors_origins and cors_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(history.router, prefix="/api/v1")
app.include_router(prediction.router, prefix="/api/v1")
app.include_router(treatments.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")

@app.get("/", tags=["Health Check"])
def health_check():
    db_status = "disconnected"
    try:
        client.admin.command("ping")
        db_status = "connected"
    except Exception:
        pass
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }
