import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import can_access_patient, get_current_user
from app.database import get_db
from app.ml.clinical_insights import ClinicalInsightsEngine
from app.ml.predictor import DataPreprocessor, ModelTrainer, PredictionEngine
from app.models.patient import Patient
from app.models.prediction import ReadmissionForecast, RiskPrediction
from app.models.user import User, UserRole
from app.schemas.prediction import (
    ClinicalInsightResponse,
    DashboardStatsResponse,
    ModelMetricsResponse,
    ReadmissionForecastRequest,
    ReadmissionForecastResponse,
    RiskPredictionRequest,
    RiskPredictionResponse,
)
from app.config import settings
from app.services.prediction_service import DatasetService, PredictionService

router = APIRouter(prefix="/predictions", tags=["Risk Prediction & Forecasting"])
prediction_service = PredictionService()


def _parse_prediction(pred: RiskPrediction) -> dict:
    data = {
        "id": pred.id,
        "patient_id": pred.patient_id,
        "risk_score": pred.risk_score,
        "risk_category": pred.risk_category,
        "readmission_probability": pred.readmission_probability,
        "model_used": pred.model_used,
        "created_at": pred.created_at,
        "feature_importance": json.loads(pred.feature_importance) if pred.feature_importance else {},
        "clinical_insights": json.loads(pred.clinical_insights) if pred.clinical_insights else [],
    }
    return data


def _parse_forecast(fc: ReadmissionForecast) -> dict:
    return {
        "id": fc.id,
        "patient_id": fc.patient_id,
        "forecast_period_days": fc.forecast_period_days,
        "readmission_probability": fc.readmission_probability,
        "confidence_score": fc.confidence_score,
        "risk_factors": json.loads(fc.risk_factors) if fc.risk_factors else [],
        "recommendations": json.loads(fc.recommendations) if fc.recommendations else [],
        "forecast_report": fc.forecast_report,
        "created_at": fc.created_at,
    }


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return prediction_service.get_dashboard_stats(db, current_user)


@router.post("/risk", response_model=RiskPredictionResponse)
def predict_risk(
    request: RiskPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_access_patient(current_user, patient):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        prediction = prediction_service.predict_risk(db, patient, request.model_type or "random_forest")
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return _parse_prediction(prediction)


@router.get("/risk/patient/{patient_id}", response_model=List[RiskPredictionResponse])
def get_patient_risk_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_access_patient(current_user, patient):
        raise HTTPException(status_code=403, detail="Access denied")

    predictions = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.patient_id == patient_id)
        .order_by(RiskPrediction.created_at.desc())
        .all()
    )
    return [_parse_prediction(p) for p in predictions]


@router.get("/risk/high-risk", response_model=List[RiskPredictionResponse])
def get_high_risk_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.risk_category == "High")
        .order_by(RiskPrediction.created_at.desc())
    )
    if current_user.role == UserRole.DOCTOR:
        query = query.join(Patient).filter(Patient.assigned_doctor_id == current_user.id)

    predictions = query.limit(50).all()
    seen = set()
    unique = []
    for p in predictions:
        if p.patient_id not in seen:
            seen.add(p.patient_id)
            unique.append(p)
    return [_parse_prediction(p) for p in unique]


@router.post("/forecast", response_model=ReadmissionForecastResponse)
def forecast_readmission(
    request: ReadmissionForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_access_patient(current_user, patient):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        forecast = prediction_service.forecast_readmission(db, patient, request.forecast_period_days)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return _parse_forecast(forecast)


@router.get("/forecast/patient/{patient_id}", response_model=List[ReadmissionForecastResponse])
def get_patient_forecasts(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_access_patient(current_user, patient):
        raise HTTPException(status_code=403, detail="Access denied")

    forecasts = (
        db.query(ReadmissionForecast)
        .filter(ReadmissionForecast.patient_id == patient_id)
        .order_by(ReadmissionForecast.created_at.desc())
        .all()
    )
    return [_parse_forecast(f) for f in forecasts]


@router.get("/clinical-insights/{patient_id}", response_model=ClinicalInsightResponse)
def get_clinical_insights(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_access_patient(current_user, patient):
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        engine = PredictionEngine()
        from app.services.prediction_service import patient_to_dict
        result = engine.predict(patient_to_dict(patient))
        insights_engine = ClinicalInsightsEngine()
        insights = insights_engine.generate_insights(
            patient,
            result["risk_score"],
            result["risk_category"],
            result["readmission_probability"],
            result.get("feature_importance", {}),
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    patient_code = f"ANON-{patient.id:06d}" if current_user.role == UserRole.RESEARCHER else patient.patient_id
    return ClinicalInsightResponse(
        patient_id=patient.id,
        patient_code=patient_code,
        risk_category=result["risk_category"],
        risk_score=result["risk_score"],
        readmission_probability=result["readmission_probability"],
        key_risk_factors=insights["key_risk_factors"],
        care_recommendations=insights["care_recommendations"],
        follow_up_plan=insights["follow_up_plan"],
        discharge_support=insights["discharge_support"],
    )


@router.get("/models/metrics", response_model=List[ModelMetricsResponse])
def get_model_metrics(current_user: User = Depends(get_current_user)):
    metrics = []
    for model_type in ["random_forest", "xgboost"]:
        m = PredictionEngine.load_metrics(model_type)
        if m:
            metrics.append(ModelMetricsResponse(**m))
    return metrics


@router.post("/models/train")
def train_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Only system administrators can train models")

    df = DataPreprocessor.load_dataset(settings.dataset_path)
    if len(df) > 20000:
        df = df.sample(n=20000, random_state=42)
    trainer = ModelTrainer()
    rf_metrics = trainer.train(df, "random_forest")
    xgb_metrics = trainer.train(df, "xgboost")
    return {"random_forest": rf_metrics, "xgboost": xgb_metrics}


@router.post("/dataset/import")
def import_dataset(
    limit: int = 500,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.HOSPITAL_ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    return DatasetService.load_and_import(db, limit)
