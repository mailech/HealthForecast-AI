import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import PatientDB, PredictionDB, UserDB
from app.schemas.schemas import PredictionInput, PredictionResult
from app.services.risk_service import risk_service
from app.auth.auth import get_current_user
from app.services.audit_service import log_action

router = APIRouter(prefix="/predict", tags=["AI Risk Prediction"])

@router.post("", response_model=PredictionResult)
def predict_readmission_risk(data: PredictionInput, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    if current_user.role not in ["Doctor", "Healthcare Researcher"]:
        raise HTTPException(status_code=403, detail="Not authorized to run predictions")

    result = risk_service.calculate_risk(data)

    if data.patient_id:
        patient = db.query(PatientDB).filter(PatientDB.id == data.patient_id).first()
        if patient:
            if current_user.role != "Healthcare Researcher":
                patient.readmission_risk_score = result.risk_score
                patient.risk_level = result.risk_level

                # Save prediction history entry
                pred_record = PredictionDB(
                    patient_id=patient.id,
                    risk_score=result.risk_score,
                    risk_level=result.risk_level,
                    confidence=result.confidence,
                    key_factors=json.dumps([f.dict() for f in result.key_factors]),
                    recommendations=json.dumps(result.recommendations)
                )
                db.add(pred_record)
                db.commit()
                log_action(db, current_user, "RUN_PREDICTION_AND_SAVE", f"Patient {data.patient_id}")
            else:
                log_action(db, current_user, "RUN_PREDICTION_ONLY", f"Patient {data.patient_id}")
        else:
            log_action(db, current_user, "RUN_PREDICTION_NO_PATIENT", "N/A")
    else:
        log_action(db, current_user, "RUN_PREDICTION_NO_PATIENT", "N/A")

    return result
