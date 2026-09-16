from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base
from .routers import (
    users,
    patients,
    dashboard,
    prediction,
    notifications,
    clinical,
    research,
    optimization,
)

from ml.model_service import load_model


# =========================
# CREATE DATABASE TABLES
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# FASTAPI LIFESPAN
# =========================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("\n========================================")
    print(" HealthForecast AI - Starting")
    print("========================================")

    # Load ML model once during application startup
    load_model()

    print("Application startup completed.")
    print("========================================\n")

    yield


# =========================
# CREATE FASTAPI APP
# =========================

app = FastAPI(
    title="HealthForecast AI",
    description="AI-powered healthcare risk prediction system",
    version="1.0.0",
    lifespan=lifespan,
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROUTERS
# =========================

app.include_router(users.router)

app.include_router(patients.router)

app.include_router(dashboard.router)

app.include_router(prediction.router)

app.include_router(notifications.router)

app.include_router(clinical.router)

app.include_router(research.router)

app.include_router(optimization.router)


# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {
        "message": "HealthForecast AI Backend Running"
    } 