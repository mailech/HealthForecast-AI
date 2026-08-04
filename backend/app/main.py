import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base, SessionLocal
from app.models.models import UserDB, PatientDB
from app.auth.auth import get_password_hash
from app.api import auth_routes, patient_routes, predict_routes, dashboard_routes, analytics_routes, report_routes

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HealthForecast AI - Clinical Intelligence API",
    description="Hospital Readmission Prediction & Patient Risk Intelligence System Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database with realistic clinical data on first run
def seed_database():
    db = SessionLocal()
    try:
        if db.query(UserDB).count() == 0:
            demo_user = UserDB(
                full_name="Dr. Sarah Jenkins",
                email="doctor@metrohealth.org",
                hashed_password=get_password_hash("password123"),
                role="Doctor",
                hospital_name="MetroHealth General Hospital"
            )
            db.add(demo_user)
            db.commit()
            print("[+] Seeded Demo Clinician Account: doctor@metrohealth.org / password123")
            
        if db.query(PatientDB).count() == 0:
            seed_patients = [
                PatientDB(
                    patient_code="HF-8041",
                    first_name="Eleanor",
                    last_name="Vance",
                    age=72,
                    gender="Female",
                    department="Cardiology",
                    primary_diagnosis="Congestive Heart Failure",
                    admission_date="2026-07-26",
                    status="Admitted",
                    prior_admissions=3,
                    emergency_visits=2,
                    length_of_stay=7,
                    charlson_index=4,
                    lace_index=13,
                    hba1c=8.6,
                    serum_sodium=132.5,
                    creatinine=2.1,
                    polypharmacy_count=11,
                    readmission_risk_score=78.4,
                    risk_level="High"
                ),
                PatientDB(
                    patient_code="HF-3912",
                    first_name="Marcus",
                    last_name="Thorne",
                    age=64,
                    gender="Male",
                    department="Pulmonology",
                    primary_diagnosis="COPD Exacerbation",
                    admission_date="2026-07-28",
                    status="Admitted",
                    prior_admissions=2,
                    emergency_visits=1,
                    length_of_stay=4,
                    charlson_index=2,
                    lace_index=9,
                    hba1c=7.1,
                    serum_sodium=137.0,
                    creatinine=1.2,
                    polypharmacy_count=6,
                    readmission_risk_score=48.2,
                    risk_level="Medium"
                ),
                PatientDB(
                    patient_code="HF-5104",
                    first_name="Sophia",
                    last_name="Chen",
                    age=58,
                    gender="Female",
                    department="Endocrinology",
                    primary_diagnosis="Type 2 Diabetes Uncontrolled",
                    admission_date="2026-07-30",
                    status="Admitted",
                    prior_admissions=0,
                    emergency_visits=0,
                    length_of_stay=2,
                    charlson_index=1,
                    lace_index=4,
                    hba1c=9.2,
                    serum_sodium=139.5,
                    creatinine=0.9,
                    polypharmacy_count=4,
                    readmission_risk_score=22.8,
                    risk_level="Low"
                ),
                PatientDB(
                    patient_code="HF-2290",
                    first_name="Arthur",
                    last_name="Pendelton",
                    age=81,
                    gender="Male",
                    department="Nephrology",
                    primary_diagnosis="Acute Kidney Injury on CKD Stage 4",
                    admission_date="2026-07-22",
                    status="Admitted",
                    prior_admissions=4,
                    emergency_visits=3,
                    length_of_stay=9,
                    charlson_index=6,
                    lace_index=15,
                    hba1c=7.8,
                    serum_sodium=130.0,
                    creatinine=3.4,
                    polypharmacy_count=14,
                    readmission_risk_score=89.1,
                    risk_level="High"
                ),
                PatientDB(
                    patient_code="HF-6733",
                    first_name="Clara",
                    last_name="O'Connor",
                    age=49,
                    gender="Female",
                    department="Internal Medicine",
                    primary_diagnosis="Community Acquired Pneumonia",
                    admission_date="2026-07-29",
                    status="Outpatient",
                    prior_admissions=1,
                    emergency_visits=0,
                    length_of_stay=3,
                    charlson_index=1,
                    lace_index=5,
                    hba1c=5.9,
                    serum_sodium=140.2,
                    creatinine=0.8,
                    polypharmacy_count=3,
                    readmission_risk_score=18.5,
                    risk_level="Low"
                )
            ]
            db.bulk_save_objects(seed_patients)
            db.commit()
            print("[+] Seeded initial hospital patient cohort")
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    seed_database()

@app.get("/")
def root():
    return {
        "system": "HealthForecast AI Backend API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }

# Register routers
app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(patient_routes.router, prefix="/api/v1")
app.include_router(predict_routes.router, prefix="/api/v1")
app.include_router(dashboard_routes.router, prefix="/api/v1")
app.include_router(analytics_routes.router, prefix="/api/v1")
app.include_router(report_routes.router, prefix="/api/v1")
