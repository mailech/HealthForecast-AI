import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.api import auth_routes, patient_routes, predict_routes, dashboard_routes, report_routes, admin_routes, analytics_routes

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HealthForecast AI",
    description="Hospital Readmission Prediction & Patient Risk Intelligence System",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*" # Can be tightened in prod
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/")
def root():
    return {
        "system": "HealthForecast AI Backend API",
        "status": "online",
        "version": "2.0.0",
        "documentation": "/docs"
    }

# Register routers
app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(patient_routes.router, prefix="/api/v1")
app.include_router(predict_routes.router, prefix="/api/v1")
app.include_router(dashboard_routes.router, prefix="/api/v1")
app.include_router(analytics_routes.router, prefix="/api/v1")
app.include_router(report_routes.router, prefix="/api/v1")
app.include_router(admin_routes.router, prefix="/api/v1")
