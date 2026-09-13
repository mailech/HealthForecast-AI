from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from typing import Dict, Any, List
from app.ml.predictor import predictor
from app.ml.train_model import train_readmission_model
from app.middleware.auth import get_current_user, require_roles
from app.models.user import User, UserRole

from app.schemas.ml import PredictionRequestSchema, PredictionResponseSchema, LoSPredictionResponseSchema
from app.middleware.rate_limiter import retrain_rate_limiter

router = APIRouter(prefix="/ml", tags=["Machine Learning AI Engine"])

# Retraining Task State
retrain_state = {
    "is_retraining": False,
    "last_retrained_at": None,
    "last_status": "Idle / Ready",
    "last_error": None
}

@router.get("/metrics")
def get_model_metrics(current_user: User = Depends(get_current_user)):
    """
    Get genuine evaluation performance metrics of the trained Diabetes 130-US Hospitals Ensemble ML Model:
    Returns Accuracy, Precision, Recall, F1-Score, ROC-AUC, PR-AUC, Brier Score, and Feature Importance rankings.
    """
    return predictor.get_metrics()

@router.get("/version")
def get_model_version_info(current_user: User = Depends(get_current_user)):
    """
    Get active model version, training timestamp, and health status.
    """
    metrics = predictor.get_metrics()
    return {
        "model_version": metrics.get("model_version", "v2.1.0"),
        "model_name": metrics.get("model_name", "Calibrated Ensemble Clinical Readmission & LoS Engine"),
        "trained_at": metrics.get("trained_at"),
        "dataset": metrics.get("dataset"),
        "sample_size": metrics.get("sample_size"),
        "status": metrics.get("status", "Operational / Production Active")
    }

@router.get("/history", response_model=List[Dict[str, Any]])
def get_model_training_history(
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN.value, UserRole.HOSPITAL_ADMIN.value, UserRole.RESEARCHER.value]))
):
    """
    Get historical audit log of all model training runs, sample sizes, and performance metrics.
    """
    return predictor.get_training_history()

@router.post("/predict", response_model=PredictionResponseSchema)
def predict_patient_readmission(payload: PredictionRequestSchema, current_user: User = Depends(get_current_user)):
    """
    Run live calibrated ML inference for a patient encounter payload with clinical bounds checking.
    """
    data_dict = payload.model_dump()
    risk_score, risk_category, readmitted_forecast, risk_drivers = predictor.predict(data_dict)
    pred_los = predictor.predict_los(data_dict)
    metrics = predictor.get_metrics()
    auc_val = metrics.get("roc_auc", 0.65)
    
    return {
        "risk_score": risk_score,
        "risk_category": risk_category,
        "readmitted_forecast": readmitted_forecast,
        "predicted_length_of_stay_days": pred_los,
        "model_version": metrics.get("model_version", "v2.1.0"),
        "model_confidence": f"{round(auc_val * 100, 1)}% ROC-AUC",
        "risk_drivers": risk_drivers
    }

@router.post("/predict-los", response_model=LoSPredictionResponseSchema)
def predict_length_of_stay(payload: PredictionRequestSchema, current_user: User = Depends(get_current_user)):
    """
    Run secondary Length of Stay (LoS in Days) regression prediction with validated features.
    """
    data_dict = payload.model_dump()
    pred_los = predictor.predict_los(data_dict)
    return {
        "predicted_length_of_stay_days": pred_los
    }

def run_retrain_task(version_tag: str):
    global retrain_state
    try:
        retrain_state["is_retraining"] = True
        retrain_state["last_status"] = "Training in progress..."
        retrain_state["last_error"] = None
        
        train_readmission_model(version=version_tag)
        predictor.load_model()
        
        retrain_state["is_retraining"] = False
        retrain_state["last_retrained_at"] = datetime.utcnow().isoformat()
        retrain_state["last_status"] = f"Completed successfully ({version_tag})"
    except Exception as e:
        retrain_state["is_retraining"] = False
        retrain_state["last_status"] = "Failed"
        retrain_state["last_error"] = str(e)
        print(f"Error in retraining task: {e}")

@router.get("/retrain/status")
def get_retrain_status(
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN.value]))
):
    """
    Check the current background retraining status (System Administrator only).
    """
    return retrain_state

@router.post("/retrain", dependencies=[Depends(retrain_rate_limiter)])
def trigger_model_retraining(
    background_tasks: BackgroundTasks,
    payload: Dict[str, Any] = None,
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN.value]))
):
    """
    Triggers automated model re-training on the Diabetes dataset.
    RESTRICTED: Only System Administrators can initiate retraining.
    """
    global retrain_state
    if retrain_state["is_retraining"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A model retraining job is already currently running."
        )
        
    now_str = datetime.utcnow().strftime("%Y%m%d_%H%M")
    version_tag = payload.get("version") if payload and "version" in payload else f"v2.1.{now_str}"
    
    retrain_state["is_retraining"] = True
    retrain_state["last_status"] = f"Initiating {version_tag}..."
    background_tasks.add_task(run_retrain_task, version_tag)
    
    return {
        "message": f"Model retraining initiated in background task as version {version_tag}.",
        "version": version_tag,
        "initiated_by": current_user.email,
        "status": "In Progress"
    }


