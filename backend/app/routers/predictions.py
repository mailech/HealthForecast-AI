import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import can_access_patient, get_current_user, require_roles
from app.database import get_db
from app.ml.clinical_insights import ClinicalInsightsEngine
from app.ml.predictor import DataPreprocessor, ModelTrainer, PredictionEngine
from app.models.patient import Patient
from app.models.prediction import ReadmissionForecast, RiskPrediction
from app.models.user import User, UserRole
from app.schemas.prediction import (
    ClinicalInsightResponse,
    ControlledTrainRequest,
    DashboardStatsResponse,
    ModelMetricsResponse,
    ReadmissionForecastRequest,
    ReadmissionForecastResponse,
    RiskPredictionRequest,
    RiskPredictionResponse,
)
from app.config import settings
from app.services.model_manager import ModelManagerService
from app.services.prediction_service import DatasetService, PredictionService

router = APIRouter(prefix="/predictions", tags=["Risk Prediction & Forecasting"])
prediction_service = PredictionService()
model_manager = ModelManagerService()



def _patient_identity(patient: Optional[Patient], hide_pii: bool) -> dict:
    if not patient:
        return {"patient_code": None, "patient_name": None}
    if hide_pii:
        return {"patient_code": f"ANON-{patient.id:06d}", "patient_name": None}
    return {"patient_code": patient.patient_id, "patient_name": patient.full_name}


def _parse_prediction(pred: RiskPrediction, patient: Optional[Patient] = None, hide_pii: bool = False) -> dict:
    identity = _patient_identity(patient, hide_pii)
    return {
        "id": pred.id,
        "patient_id": pred.patient_id,
        "patient_code": identity["patient_code"],
        "patient_name": identity["patient_name"],
        "risk_score": pred.risk_score,
        "risk_category": pred.risk_category,
        "readmission_probability": pred.readmission_probability,
        "model_used": pred.model_used,
        "created_at": pred.created_at,
        "feature_importance": json.loads(pred.feature_importance) if pred.feature_importance else {},
        "clinical_insights": json.loads(pred.clinical_insights) if pred.clinical_insights else [],
    }


def _parse_forecast(fc: ReadmissionForecast, patient: Optional[Patient] = None, hide_pii: bool = False) -> dict:
    identity = _patient_identity(patient, hide_pii)
    return {
        "id": fc.id,
        "patient_id": fc.patient_id,
        "patient_code": identity["patient_code"],
        "patient_name": identity["patient_name"],
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
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.RESEARCHER])),
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
    hide_pii = current_user.role == UserRole.RESEARCHER
    return _parse_prediction(prediction, patient, hide_pii)


@router.get("/risk/patient/{patient_id}", response_model=List[RiskPredictionResponse])
def get_patient_risk_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.RESEARCHER])),
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
    return [_parse_prediction(p, patient, current_user.role == UserRole.RESEARCHER) for p in predictions]


@router.get("/risk/high-risk", response_model=List[RiskPredictionResponse])
def get_high_risk_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.RESEARCHER])),
):
    query = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.risk_category == "High")
        .order_by(RiskPrediction.created_at.desc())
    )
    if current_user.role == UserRole.DOCTOR:
        query = query.join(Patient).filter(Patient.assigned_doctor_id == current_user.id)

    predictions = query.limit(50).all()
    hide_pii = current_user.role == UserRole.RESEARCHER
    seen = set()
    unique = []
    for p in predictions:
        if p.patient_id not in seen:
            seen.add(p.patient_id)
            unique.append(p)
    patient_ids = [p.patient_id for p in unique]
    patients = {row.id: row for row in db.query(Patient).filter(Patient.id.in_(patient_ids)).all()} if patient_ids else {}
    return [_parse_prediction(p, patients.get(p.patient_id), hide_pii) for p in unique]


@router.post("/forecast", response_model=ReadmissionForecastResponse)
def forecast_readmission(
    request: ReadmissionForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.RESEARCHER])),
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
    return _parse_forecast(forecast, patient, current_user.role == UserRole.RESEARCHER)


@router.get("/forecast/patient/{patient_id}", response_model=List[ReadmissionForecastResponse])
def get_patient_forecasts(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.RESEARCHER])),
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
    return [_parse_forecast(f, patient, current_user.role == UserRole.RESEARCHER) for f in forecasts]


@router.get("/clinical-insights/{patient_id}", response_model=ClinicalInsightResponse)
def get_clinical_insights(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR])),
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

    hide_pii = current_user.role == UserRole.RESEARCHER
    patient_code = f"ANON-{patient.id:06d}" if hide_pii else patient.patient_id
    patient_name = None if hide_pii else patient.full_name
    return ClinicalInsightResponse(
        patient_id=patient.id,
        patient_code=patient_code,
        patient_name=patient_name,
        risk_category=result["risk_category"],
        risk_score=result["risk_score"],
        readmission_probability=result["readmission_probability"],
        key_risk_factors=insights["key_risk_factors"],
        care_recommendations=insights["care_recommendations"],
        clinical_pillars=insights.get("clinical_pillars", {}),
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


@router.get("/models/versions")
def get_model_versions(
    model_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN])),
):
    """Retrieve version registry and performance tracking history across models."""
    return model_manager.get_version_history(db, model_name)


@router.get("/models/monitoring")
def get_model_monitoring(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN, UserRole.HOSPITAL_ADMIN])),
):
    """Real-time model monitoring, prediction drift detection, and serving statistics."""
    return model_manager.get_monitoring_dashboard(db)


@router.post("/models/train")
def train_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN])),
):
    """Retrain standard Random Forest and XGBoost with balanced class weights and threshold calibration."""
    rf_metrics = model_manager.controlled_retrain(
        db=db,
        model_type="random_forest",
        sample_size=20000,
        class_weight_strategy="balanced",
        trained_by=current_user.username,
        notes="Standard retrain with balanced class weights and threshold calibration",
    )
    xgb_metrics = model_manager.controlled_retrain(
        db=db,
        model_type="xgboost",
        sample_size=20000,
        class_weight_strategy="balanced",
        trained_by=current_user.username,
        notes="Standard retrain with scale_pos_weight and threshold calibration",
    )
    return {"random_forest": rf_metrics, "xgboost": xgb_metrics}


@router.post("/models/train-controlled")
def train_controlled(
    request: ControlledTrainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN])),
):
    """Controlled retraining with configurable sample size, hyperparameters, and class weighting."""
    models_to_train = ["random_forest", "xgboost"] if request.model_type == "both" else [request.model_type]
    results = {}

    for m in models_to_train:
        res = model_manager.controlled_retrain(
            db=db,
            model_type=m,
            sample_size=request.sample_size,
            class_weight_strategy=request.class_weight_strategy,
            hyperparameters=request.hyperparameters,
            notes=request.notes,
            trained_by=current_user.username,
        )
        results[m] = res

    return results


@router.post("/models/activate/{version_id}")
def activate_model_version(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN])),
):
    """Promote a candidate model version to active production status."""
    try:
        return model_manager.activate_version(db, version_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/models/rollback/{model_type}")
def rollback_model_version(
    model_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN])),
):
    """Rollback active model to the immediate previous version."""
    try:
        return model_manager.rollback_model(db, model_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/dataset/import")
def import_dataset(
    limit: int = 500,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN])),
):
    """Import dataset records (restricted strictly to System Administrator)."""
    return DatasetService.load_and_import(db, limit)

