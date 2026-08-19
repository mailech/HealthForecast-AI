from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, patients, predictions

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="Hospital Readmission Prediction & Patient Risk Intelligence System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "HealthForecast AI API",
        "version": "1.0.0",
        "docs": "/docs",
        "milestones_completed": ["Milestone 1", "Milestone 2"],
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.app_name}
