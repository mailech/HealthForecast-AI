from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, patients, medical_history, admissions, treatments, dashboard, dataset, predictions
from app.core.database import engine
from app.models import user as user_model
from app.models import role as role_model
from app.models import patient as patient_model
from app.models import medical_history as medical_history_model
from app.models import admission as admission_model
from app.models import treatment as treatment_model
from app.models import audit_log as audit_log_model
from app.models import risk_prediction as risk_prediction_model

# Create all tables
user_model.Base.metadata.create_all(bind=engine)
role_model.Base.metadata.create_all(bind=engine)
patient_model.Base.metadata.create_all(bind=engine)
medical_history_model.Base.metadata.create_all(bind=engine)
admission_model.Base.metadata.create_all(bind=engine)
treatment_model.Base.metadata.create_all(bind=engine)
audit_log_model.Base.metadata.create_all(bind=engine)
risk_prediction_model.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HealthForecast AI API",
    description="Hospital Readmission Prediction & Patient Risk Intelligence System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(medical_history.router, prefix="/api/medical-history", tags=["Medical History"])
app.include_router(admissions.router, prefix="/api/admissions", tags=["Admissions"])
app.include_router(treatments.router, prefix="/api/treatments", tags=["Treatments"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(dataset.router, prefix="/api/dataset", tags=["Dataset"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])


@app.get("/")
def root():
    return {"message": "HealthForecast AI API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
