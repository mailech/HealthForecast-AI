from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, patients, encounters, system, predictions, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["User Management"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patients"])
api_router.include_router(encounters.router, prefix="/encounters", tags=["Clinical Encounters"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Risk Predictions & CDSS"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Treatment & Outcome Analytics"])
api_router.include_router(system.router, prefix="/system", tags=["System & Ingestion"])


