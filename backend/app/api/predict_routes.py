import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import PatientDB, PredictionDB
from app.schemas.schemas import PredictionInput, PredictionResult
from app.services.risk_service import risk_service

router = APIRouter(prefix="/predict", tags=["AI Risk Prediction"])

@router.post("", response_model=PredictionResult)
def predict_readmission_risk(data: PredictionInput, db: Session = Depends(get_db)):
    result = risk_service.calculate_risk(data)
    
    if data.patient_id:
        patient = db.query(PatientDB).filter(PatientDB.id == data.patient_id).first()
        if patient:
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
            
    return result
