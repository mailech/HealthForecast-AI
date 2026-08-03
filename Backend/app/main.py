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

from app.routes import auth, users, patients, history, prediction, treatments, dashboard, reports, upload

DEMO_USERS = [
    {
        "email": "doctor@hospital.com",
        "full_name": "Dr. Sarah Connor",
        "role": "Doctor",
        "hospital": "General Hospital",
        "password": "Password123",
    },
    {
        "email": "admin@hospital.com",
        "full_name": "Admin Officer John Connor",
        "role": "Hospital Administrator",
        "hospital": "General Hospital",
        "password": "Password123",
    },
    {
        "email": "researcher@hospital.com",
        "full_name": "Dr. Miles Dyson",
        "role": "Healthcare Researcher",
        "hospital": "Cyberdyne Lab",
        "password": "Password123",
    },
    {
        "email": "sysadmin@hospital.com",
        "full_name": "System Administrator",
        "role": "System Administrator",
        "hospital": "IT Headquarters",
        "password": "Password123",
    },
]

def ensure_demo_users():
    """
    Creates any missing demo accounts on startup.
    Never overwrites existing users or touches other collections.
    """
    for u in DEMO_USERS:
        if not users_collection.find_one({"email": u["email"]}):
            users_collection.insert_one({
                "email": u["email"],
                "full_name": u["full_name"],
                "role": u["role"],
                "hospital": u["hospital"],
                "hashed_password": get_password_hash(u["password"]),
                "is_active": True,
                "created_at": datetime.utcnow(),
            })

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
