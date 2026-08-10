from fastapi import FastAPI, Depends  # type: ignore[import]
from fastapi.middleware.cors import CORSMiddleware
from app.auth import router as auth_router
from app.patients import router as patients_router
from app.risk import router as risk_router
from app.security import get_current_user, require_role
from app.treatments import router as treatments_router 
from app.decision_support import router as decision_support_router
from app.analytics import router as analytics_router
from app.model_management import router as model_router

app = FastAPI(title="HealthForecast AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(risk_router)
app.include_router(treatments_router)
app.include_router(decision_support_router)
app.include_router(analytics_router)
app.include_router(model_router)

@app.get("/")
def read_root():
    return {"message": "HealthForecast AI backend is running"}


@app.get("/me")
def read_current_user(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
    }


@app.get("/admin-only")
def admin_only_route(current_user=Depends(require_role("system_admin"))):
    return {"message": f"Welcome, System Admin {current_user.full_name}!"}

@app.get("/doctor-only")
def doctor_only_route(current_user=Depends(require_role("doctor", "system_admin"))):
    return {"message": f"Welcome, Dr. {current_user.full_name}!"}

@app.get("/hospital-admin-only")
def hospital_admin_only_route(current_user=Depends(require_role("hospital_administrator", "system_admin"))):
    return {"message": f"Welcome, Hospital Admin {current_user.full_name}!"}

@app.get("/researcher-only")
def researcher_only_route(current_user=Depends(require_role("healthcare_researcher", "system_admin"))):
    return {"message": f"Welcome, Researcher {current_user.full_name}!"}
