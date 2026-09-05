import os
import json
import joblib
import pandas as pd
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Local application modules
from database import engine, Base, get_db, SessionLocal
import models
import schemas
import auth
from dependencies import get_current_user, require_doctor, require_admin, require_authorized_user

load_dotenv()

# ==========================================================
# 1. DATABASE STARTUP & SEED DEMO USERS
# ==========================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default demonstration users if not already present
    db = SessionLocal()
    try:
        if not db.query(models.User).filter(models.User.username == "doctor@hospital.com").first():
            doctor_user = models.User(
                username="doctor@hospital.com",
                password_hash=auth.hash_password("doctor123"),
                role="Doctor"
            )
            db.add(doctor_user)
        
        if not db.query(models.User).filter(models.User.username == "admin@hospital.com").first():
            admin_user = models.User(
                username="admin@hospital.com",
                password_hash=auth.hash_password("admin123"),
                role="Hospital Administrator"
            )
            db.add(admin_user)
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
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
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
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists."
        )
    
    # Validate role
    if user_data.role not in ["Doctor", "Hospital Administrator"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'Doctor' or 'Hospital Administrator'."
        )

    new_user = models.User(
        username=user_data.username,
        password_hash=auth.hash_password(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
@app.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == credentials.username).first()
    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}
    )
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

        # 1. Retrieve or Create Patient in SQLite
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
        # Map hyphenated medication columns as expected by the encoder
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

        # 5. Persist Prediction to SQLite
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
    current_user: models.User = Depends(require_authorized_user)
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
