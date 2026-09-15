import os
import json
import joblib
import pandas as pd
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Local application modules
from database import engine, Base, get_db, SessionLocal
import models
import schemas
import auth
from dependencies import (
    get_current_user, require_doctor, require_admin,
    require_authorized_user, require_researcher, require_sysadmin,
    require_any_authenticated, require_admin_or_sysadmin
)

load_dotenv()

# ==========================================================
# 1. DATABASE STARTUP & SEED ALL 4 ROLE DEMO USERS
# ==========================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default users for all 4 roles
    db = SessionLocal()
    try:
        seed_users = [
            {"username": "doctor@hospital.com", "full_name": "Dr. Sarah Chen", "password": "doctor123", "role": "Doctor"},
            {"username": "admin@hospital.com", "full_name": "James Wilson", "password": "admin123", "role": "Hospital Administrator"},
            {"username": "researcher@hospital.com", "full_name": "Dr. Emily Rodriguez", "password": "researcher123", "role": "Healthcare Researcher"},
            {"username": "sysadmin@hospital.com", "full_name": "Alex Kumar", "password": "sysadmin123", "role": "System Administrator"},
        ]
        for u in seed_users:
            existing = db.query(models.User).filter(models.User.username == u["username"]).first()
            if not existing:
                new_user = models.User(
                    username=u["username"],
                    full_name=u["full_name"],
                    password_hash=auth.hash_password(u["password"]),
                    role=u["role"]
                )
                db.add(new_user)
        db.commit()
    finally:
        db.close()
    
    yield

# ==========================================================
# 2. FASTAPI APP & CORS SETUP
# ==========================================================
app = FastAPI(
    title="HealthForecast AI - Readmission Prediction API",
    description="Hospital readmission prediction decision-support system powered by XGBoost, FastAPI, SQLite, and JWT Auth.",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5174,http://127.0.0.1:5174,http://localhost:4173,http://127.0.0.1:4173")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# 3. LOAD EXISTING ML MODEL ARTIFACTS
# ==========================================================
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_model")

try:
    model = joblib.load(os.path.join(MODEL_DIR, "xgboost_readmission_model.pkl"))
    encoder = joblib.load(os.path.join(MODEL_DIR, "onehot_encoder.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "standard_scaler.pkl"))

    with open(os.path.join(MODEL_DIR, "feature_columns.json")) as f:
        feature_info = json.load(f)

    categorical_cols = feature_info["categorical_cols"]
    numerical_cols = feature_info["numerical_cols"]
    final_feature_names = feature_info["final_feature_names"]
    MODEL_LOADED = True
except Exception as e:
    print(f"Warning: Could not load ML model files: {e}")
    MODEL_LOADED = False

def clean_column_name(name: str) -> str:
    """Helper to match trained XGBoost feature names exactly."""
    return name.replace("[", "").replace("]", "").replace("<", "lt_")


# ==========================================================
# HELPER: Generate clinical insights based on patient data
# ==========================================================
def generate_clinical_insights(data: dict, probability: float, risk_class: str) -> list:
    """Generate evidence-based clinical recommendations from patient features."""
    insights = []

    # High inpatient history
    if data.get("number_inpatient", 0) >= 2:
        insights.append({
            "factor": "Prior Inpatient Visits",
            "impact": "high",
            "recommendation": "History of ≥2 inpatient visits in the prior year is a strong readmission predictor. Consider post-discharge follow-up within 48 hours."
        })

    # Emergency visits
    if data.get("number_emergency", 0) >= 2:
        insights.append({
            "factor": "Emergency Department Utilization",
            "impact": "high",
            "recommendation": "Frequent ED visits suggest unmanaged chronic conditions. Evaluate outpatient care plan and medication adherence."
        })

    # Extended hospital stay
    if data.get("time_in_hospital", 0) >= 7:
        insights.append({
            "factor": "Extended Hospital Stay",
            "impact": "moderate",
            "recommendation": f"Hospital stay of {data.get('time_in_hospital')} days is above average. Ensure comprehensive discharge planning and home care coordination."
        })

    # High medication count
    if data.get("num_medications", 0) >= 18:
        insights.append({
            "factor": "Polypharmacy Risk",
            "impact": "moderate",
            "recommendation": f"Patient is on {data.get('num_medications')} medications. Review for potential drug interactions and simplification of regimen."
        })

    # Multiple diagnoses
    if data.get("number_diagnoses", 0) >= 8:
        insights.append({
            "factor": "High Diagnostic Complexity",
            "impact": "moderate",
            "recommendation": "Multiple active diagnoses increase readmission risk. Consider multidisciplinary care team involvement."
        })

    # Elderly patient
    if data.get("age", "") in ["[70-80)", "[80-90)", "[90-100)"]:
        insights.append({
            "factor": "Advanced Age",
            "impact": "moderate",
            "recommendation": "Patients aged 70+ have elevated readmission risk. Assess fall risk, cognitive status, and social support network."
        })

    # Diabetes medication changes
    if data.get("diabetesMed", "No") == "Yes" and data.get("change", "No") == "Ch":
        insights.append({
            "factor": "Diabetes Medication Adjustment",
            "impact": "moderate",
            "recommendation": "Recent diabetes medication changes warrant close glycemic monitoring post-discharge. Schedule follow-up within 7 days."
        })

    # HbA1c elevated
    if data.get("A1Cresult", "None") in [">7", ">8"]:
        insights.append({
            "factor": "Elevated HbA1c",
            "impact": "high",
            "recommendation": "Elevated HbA1c indicates poor glycemic control. Reinforce diabetes self-management education and consider endocrinology referral."
        })

    # Discharge to SNF
    if data.get("discharge_disposition_id", "1") in ["3", "4", "5"]:
        insights.append({
            "factor": "Post-Acute Care Facility Discharge",
            "impact": "moderate",
            "recommendation": "Discharge to skilled nursing or care facility suggests functional limitations. Ensure transition of care documentation is complete."
        })

    # If no specific risk factors found but probability is still elevated
    if not insights and probability >= 0.3:
        insights.append({
            "factor": "Aggregate Risk Pattern",
            "impact": "moderate",
            "recommendation": "While no single dominant risk factor is identified, the combination of clinical features indicates elevated readmission risk. Standard post-discharge follow-up protocols are recommended."
        })

    # Low risk reassurance
    if risk_class == "LOW" and not insights:
        insights.append({
            "factor": "Low Risk Profile",
            "impact": "low",
            "recommendation": "Patient presents a low readmission risk profile. Standard discharge instructions and follow-up scheduling are appropriate."
        })

    return insights


# ==========================================================
# HELPER: Log audit event
# ==========================================================
def log_audit(db: Session, user_id: int, action: str, detail: str = "", ip: str = ""):
    entry = models.AuditLog(user_id=user_id, action=action, detail=detail, ip_address=ip)
    db.add(entry)
    db.commit()


# ==========================================================
# HELPER: Create notification
# ==========================================================
def create_notification(db: Session, user_id: int, title: str, message: str, category: str = "info"):
    notif = models.Notification(user_id=user_id, title=title, message=message, category=category)
    db.add(notif)
    db.commit()


# ==========================================================
# 4. HEALTH & ROOT ENDPOINTS
# ==========================================================
@app.get("/")
def root():
    return {
        "message": "HealthForecast AI Readmission Prediction API is online",
        "docs": "/docs",
        "health": "/health",
        "model_performance": {
            "roc_auc": 0.658,
            "positive_class_recall": 0.59
        }
    }

@app.get("/health")
def health(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.query(models.User).first()
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy" if MODEL_LOADED and db_status == "connected" else "degraded",
        "database": db_status,
        "model_loaded": MODEL_LOADED,
        "model_type": "XGBoost Classifier",
        "model_roc_auc": 0.658,
        "model_recall": 0.59
    }


# ==========================================================
# 5. AUTHENTICATION ENDPOINTS
# ==========================================================
@app.post("/auth/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, request: Request, db: Session = Depends(get_db)):
    identifier = (user_data.username or user_data.email or "").strip()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is required."
        )

    # Check for existing user (case-insensitive on username or email)
    existing = db.query(models.User).filter(
        or_(
            func.lower(models.User.username) == identifier.lower(),
            func.lower(models.User.email) == identifier.lower()
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username or email already exists."
        )
    
    # Validate role
    if user_data.role not in schemas.VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role must be one of: {', '.join(schemas.VALID_ROLES)}"
        )

    email_val = (user_data.email or "").strip()
    if not email_val and "@" in identifier:
        email_val = identifier

    new_user = models.User(
        username=identifier,
        email=email_val,
        full_name=user_data.full_name or "",
        password_hash=auth.hash_password(user_data.password),
        role=user_data.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Audit log
    log_audit(db, new_user.id, "USER_REGISTERED", f"New {user_data.role} account: {identifier}", request.client.host if request.client else "")
    
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
@app.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, request: Request, db: Session = Depends(get_db)):
    login_id = (credentials.username or credentials.email or "").strip()
    if not login_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is required."
        )

    # 1. Exact match (case-insensitive) on username or email
    user = db.query(models.User).filter(
        or_(
            func.lower(models.User.username) == login_id.lower(),
            func.lower(models.User.email) == login_id.lower()
        )
    ).first()

    # 2. If login_id has no '@', try matching username starting with that prefix
    if not user and "@" not in login_id:
        user = db.query(models.User).filter(
            models.User.username.ilike(f"{login_id}@%")
        ).first()

    # 3. If login_id has '@', try matching prefix before '@'
    if not user and "@" in login_id:
        prefix = login_id.split("@")[0]
        user = db.query(models.User).filter(
            func.lower(models.User.username) == prefix.lower()
        ).first()

    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Contact your system administrator."
        )

    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}
    )

    # Audit log
    log_audit(db, user.id, "USER_LOGIN", f"{user.role} logged in", request.client.host if request.client else "")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role
    }

@app.get("/auth/me", response_model=schemas.UserOut)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


# ==========================================================
# 6. PATIENT ENDPOINTS
# ==========================================================
@app.post("/patients", response_model=schemas.PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_data: schemas.PatientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authorized_user)
):
    patient_dict = patient_data.model_dump()
    new_patient = models.Patient(**patient_dict)
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@app.get("/patients", response_model=List[schemas.PatientOut])
def get_patients(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authorized_user),
    skip: int = 0,
    limit: int = 100
):
    patients = db.query(models.Patient).order_by(models.Patient.created_at.desc()).offset(skip).limit(limit).all()
    return patients

@app.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authorized_user)
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")
    return patient


# ==========================================================
# 7. ML PREDICTION & STORAGE ENDPOINTS
# ==========================================================
@app.post("/predict", response_model=schemas.PredictionOut)
def predict(
    payload: schemas.PredictionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authorized_user)
):
    if not MODEL_LOADED:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Machine learning model is not currently loaded on the server."
        )

    try:
        data = payload.model_dump()
        patient_name = data.pop("patient_name", "Anonymous Patient")
        patient_id = data.pop("patient_id", None)

        # 1. Retrieve or Create Patient
        if patient_id:
            patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
            if not patient:
                raise HTTPException(status_code=404, detail=f"Patient with ID {patient_id} not found.")
        else:
            patient = models.Patient(patient_name=patient_name, **data)
            db.add(patient)
            db.commit()
            db.refresh(patient)

        # 2. Prepare Data for the Exact ML Pipeline
        ml_data = data.copy()
        ml_data["glyburide-metformin"] = ml_data.pop("glyburide_metformin")
        ml_data["glipizide-metformin"] = ml_data.pop("glipizide_metformin")
        ml_data["glimepiride-pioglitazone"] = ml_data.pop("glimepiride_pioglitazone")
        ml_data["metformin-rosiglitazone"] = ml_data.pop("metformin_rosiglitazone")
        ml_data["metformin-pioglitazone"] = ml_data.pop("metformin_pioglitazone")

        df = pd.DataFrame([ml_data])

        # Categorical Encoding
        cat_data = encoder.transform(df[categorical_cols])
        cat_cols_out = encoder.get_feature_names_out(categorical_cols)
        cat_df = pd.DataFrame(cat_data, columns=cat_cols_out)

        # Numerical Scaling
        num_data = scaler.transform(df[numerical_cols])
        num_df = pd.DataFrame(num_data, columns=numerical_cols)

        # Merge, Clean & Reindex
        final_df = pd.concat([num_df, cat_df], axis=1)
        final_df.columns = [clean_column_name(c) for c in final_df.columns]
        final_df = final_df.reindex(columns=final_feature_names, fill_value=0)

        # 3. Run XGBoost Inference
        probability = float(model.predict_proba(final_df)[0][1])
        risk_percentage = round(probability * 100.0, 2)

        # 4. Determine Clinical Risk Category
        if probability >= 0.7:
            risk_class = "CRITICAL"
            prediction_label = "High Readmission Risk"
        elif probability >= 0.5:
            risk_class = "HIGH"
            prediction_label = "Elevated Readmission Risk"
        elif probability >= 0.3:
            risk_class = "MEDIUM"
            prediction_label = "Moderate Readmission Risk"
        else:
            risk_class = "LOW"
            prediction_label = "Low Readmission Risk"

        # 5. Generate Clinical Insights
        clinical_insights = generate_clinical_insights(data, probability, risk_class)

        # 6. Persist Prediction
        new_pred = models.Prediction(
            patient_id=patient.id,
            probability=round(probability, 4),
            risk_class=risk_class,
            prediction=prediction_label,
            created_by=current_user.id
        )
        db.add(new_pred)
        db.commit()
        db.refresh(new_pred)

        # 7. Create notifications for high-risk predictions
        if risk_class in ["HIGH", "CRITICAL"]:
            # Notify the doctor who made the prediction
            create_notification(
                db, current_user.id,
                f"⚠️ {risk_class} Risk: {patient_name}",
                f"Patient {patient_name} has a {risk_percentage}% readmission probability. Immediate clinical review recommended.",
                "critical" if risk_class == "CRITICAL" else "warning"
            )
            # Notify all Hospital Administrators
            admins = db.query(models.User).filter(models.User.role == "Hospital Administrator").all()
            for admin in admins:
                create_notification(
                    db, admin.id,
                    f"🏥 {risk_class} Risk Alert: {patient_name}",
                    f"Dr. {current_user.username} identified {patient_name} with {risk_percentage}% readmission risk.",
                    "warning"
                )

        return {
            "id": new_pred.id,
            "patient_id": patient.id,
            "patient_name": patient.patient_name,
            "probability": round(probability, 4),
            "risk_percentage": risk_percentage,
            "risk_class": risk_class,
            "prediction": prediction_label,
            "predicted_by": current_user.username,
            "created_at": new_pred.created_at,
            "clinical_insights": clinical_insights,
            "note": "This prediction is intended for academic decision-support demonstration and is not a medical diagnosis."
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inference error: {str(e)}"
        )

@app.get("/predictions")
def get_predictions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_authorized_user),
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.Prediction)
    
    # Doctor sees their own predictions; Administrator sees all predictions
    if current_user.role == "Doctor":
        query = query.filter(models.Prediction.created_by == current_user.id)
    
    predictions = query.order_by(models.Prediction.created_at.desc()).offset(skip).limit(limit).all()
    
    results = []
    for p in predictions:
        patient = db.query(models.Patient).filter(models.Patient.id == p.patient_id).first()
        creator = db.query(models.User).filter(models.User.id == p.created_by).first()
        results.append({
            "id": p.id,
            "patient_id": p.patient_id,
            "patient_name": patient.patient_name if patient else "Unknown",
            "probability": p.probability,
            "risk_percentage": round(p.probability * 100.0, 2),
            "risk_class": p.risk_class,
            "prediction": p.prediction,
            "created_by": creator.username if creator else "Unknown",
            "created_at": p.created_at
        })
    return results


# ==========================================================
# 8. ADMIN & DASHBOARD STATS
# ==========================================================
@app.get("/admin/stats", response_model=schemas.DashboardStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin_or_sysadmin)
):
    total_patients = db.query(models.Patient).count()
    total_predictions = db.query(models.Prediction).count()
    high_risk_predictions = db.query(models.Prediction).filter(
        models.Prediction.risk_class.in_(["HIGH", "CRITICAL"])
    ).count()
    lower_risk_predictions = db.query(models.Prediction).filter(
        models.Prediction.risk_class.in_(["LOW", "MEDIUM"])
    ).count()

    return {
        "total_patients": total_patients,
        "total_predictions": total_predictions,
        "high_risk_predictions": high_risk_predictions,
        "lower_risk_predictions": lower_risk_predictions,
        "model_roc_auc": 0.658,
        "model_recall": 0.59
    }


# ==========================================================
# 9. RESEARCHER ENDPOINTS (anonymized / aggregated analytics)
# ==========================================================
@app.get("/researcher/analytics", response_model=schemas.ResearcherAnalytics)
def get_researcher_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_researcher)
):
    """Aggregated, anonymized analytics for Healthcare Researcher role."""
    total_predictions = db.query(models.Prediction).count()
    
    # Risk distribution
    risk_dist = {}
    for rc in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        risk_dist[rc] = db.query(models.Prediction).filter(models.Prediction.risk_class == rc).count()
    
    # Average probability
    avg_prob_result = db.query(func.avg(models.Prediction.probability)).scalar()
    avg_prob = float(avg_prob_result) if avg_prob_result else 0.0
    
    # Age group distribution (from patients)
    age_dist = {}
    age_groups = db.query(models.Patient.age, func.count(models.Patient.id)).group_by(models.Patient.age).all()
    for age, count in age_groups:
        age_dist[age] = count
    
    # Gender distribution
    gender_dist = {}
    genders = db.query(models.Patient.gender, func.count(models.Patient.id)).group_by(models.Patient.gender).all()
    for gender, count in genders:
        gender_dist[gender] = count
    
    # Top diagnosis groups
    diag_dist = {}
    diags = db.query(models.Patient.diag_1_group, func.count(models.Patient.id)).group_by(models.Patient.diag_1_group).all()
    for diag, count in diags:
        diag_dist[diag] = count
    
    # Readmission rate (predictions with prob >= 0.5)
    high_risk_count = db.query(models.Prediction).filter(models.Prediction.probability >= 0.5).count()
    readmission_rate = round((high_risk_count / total_predictions * 100) if total_predictions > 0 else 0.0, 2)
    
    return {
        "total_predictions": total_predictions,
        "risk_distribution": risk_dist,
        "avg_probability": round(avg_prob, 4),
        "age_group_distribution": age_dist,
        "gender_distribution": gender_dist,
        "top_diagnosis_groups": diag_dist,
        "readmission_rate": readmission_rate,
        "model_roc_auc": 0.658,
        "model_recall": 0.59
    }


# ==========================================================
# 10. SYSTEM ADMINISTRATOR ENDPOINTS
# ==========================================================
@app.get("/sysadmin/health", response_model=schemas.SystemHealth)
def sysadmin_health(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_sysadmin)
):
    db_status = "connected"
    try:
        db.query(models.User).first()
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy" if MODEL_LOADED and db_status == "connected" else "degraded",
        "database": db_status,
        "model_loaded": MODEL_LOADED,
        "total_users": db.query(models.User).count(),
        "total_patients": db.query(models.Patient).count(),
        "total_predictions": db.query(models.Prediction).count(),
        "uptime_info": "System operational"
    }

@app.get("/sysadmin/users", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_sysadmin)
):
    """List all registered users. System Administrator only."""
    return db.query(models.User).order_by(models.User.created_at.desc()).all()

@app.patch("/sysadmin/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    update: schemas.UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_sysadmin)
):
    """Update user status or role. System Administrator only."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own account through this endpoint.")
    
    changes = []
    if update.is_active is not None:
        user.is_active = update.is_active
        changes.append(f"is_active={update.is_active}")
    if update.role is not None:
        if update.role not in schemas.VALID_ROLES:
            raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(schemas.VALID_ROLES)}")
        user.role = update.role
        changes.append(f"role={update.role}")
    
    db.commit()
    db.refresh(user)
    
    log_audit(db, current_user.id, "USER_UPDATED", f"Updated user #{user_id}: {', '.join(changes)}", request.client.host if request.client else "")
    
    return user

@app.get("/sysadmin/audit-logs", response_model=List[schemas.AuditLogOut])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_sysadmin),
    skip: int = 0,
    limit: int = 100
):
    """View system audit logs. System Administrator only."""
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).offset(skip).limit(limit).all()


# ==========================================================
# 11. NOTIFICATIONS ENDPOINTS
# ==========================================================
@app.get("/notifications", response_model=List[schemas.NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_any_authenticated),
    limit: int = 50
):
    """Get notifications for the current user."""
    return db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id) | (models.Notification.user_id == None)
    ).order_by(models.Notification.created_at.desc()).limit(limit).all()

@app.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_any_authenticated)
):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.is_read = True
    db.commit()
    return {"status": "ok", "message": "Notification marked as read."}

@app.get("/notifications/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_any_authenticated)
):
    count = db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id) | (models.Notification.user_id == None),
        models.Notification.is_read == False
    ).count()
    return {"unread_count": count}
