from fastapi import APIRouter

from app.api.routes import admissions, auth, billing, patient_self, patients, risk, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(patients.router)
api_router.include_router(admissions.router)
api_router.include_router(risk.router)
api_router.include_router(billing.router)
api_router.include_router(patient_self.router)
