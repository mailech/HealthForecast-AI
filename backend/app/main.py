from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.prediction import router as prediction_router
from .routers.treatment_analytics import router as treatment_analytics_router

from .database import Base, engine
from .settings import FRONTEND_URL
from .models import (
    User,
    Patient,
    MedicalHistory,
    Treatment,
    Admission,
)
from .routers.auth import router as auth_router
from .routers.patient import router as patient_router



app = FastAPI(
    title="HealthForecast AI",
    version="1.0.0"
)


# Create database tables
Base.metadata.create_all(bind=engine)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication routes
app.include_router(auth_router)

# Patient management routes
app.include_router(patient_router)

app.include_router(prediction_router)

app.include_router(treatment_analytics_router)


@app.get("/")
def home():
    return {
        "message": "HealthForecast AI Backend Running Successfully"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }