from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base
from .routers import (
    users,
    patients,
    dashboard,
    prediction,
)


# =========================
# CREATE DATABASE TABLES
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# CREATE FASTAPI APP
# =========================

app = FastAPI(
    title="HealthForecast AI",
    description="AI-powered healthcare risk prediction system",
    version="1.0.0",
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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


# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {
        "message": "HealthForecast AI Backend Running"
    } 