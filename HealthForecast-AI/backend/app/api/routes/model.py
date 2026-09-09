import json
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import require_roles
from app.ml.model_service import model_service, MODEL_PATH

router=APIRouter(prefix="/model", tags=["AI Model Management"])

@router.get("/status")
def status(user=Depends(require_roles("healthcare_researcher"))):
    model_service.load_or_train()
    metrics=json.loads(model_service.METRICS_PATH.read_text()) if model_service.METRICS_PATH.exists() else {}
    return {"model_version":model_service.version,"artifact_exists":MODEL_PATH.exists(),"dataset_rows":metrics.get("dataset_rows",0)}

@router.post("/train")
def train(user=Depends(require_roles("healthcare_researcher"))):
    model_service.model=None
    model_service.train()
    model_service.model=__import__("joblib").load(MODEL_PATH)
    from app.services.prediction_population import ensure_dataset_predictions
    from app.db.session import SessionLocal
    db=SessionLocal()
    try:
        count=ensure_dataset_predictions(db)
    finally:
        db.close()
    return {"message":"Model trained successfully","version":model_service.version,"dataset_predictions":count}

@router.get("/metrics")
def metrics(user=Depends(require_roles("healthcare_researcher","doctor","hospital_administrator"))):
    if not model_service.METRICS_PATH.exists():
        model_service.load_or_train()
    return json.loads(model_service.METRICS_PATH.read_text())

@router.get("/feature-importance")
def feature_importance(user=Depends(require_roles("healthcare_researcher"))):
    model_service.load_or_train()
    features=["age","time_in_hospital","num_lab_procedures","num_procedures","num_medications","number_outpatient","number_emergency","number_inpatient","number_diagnoses"]
    values=getattr(model_service.model,"feature_importances_",[])
    return [{"feature":f,"importance":round(float(v),6)} for f,v in sorted(zip(features,values),key=lambda x:x[1],reverse=True)]
