import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.rbac import Role, require_roles
from app.models.patient import Admission, Patient, PatientAssignment, RiskScore
from app.schemas.patient import RiskScoreOut
from app.services.risk_prediction import predict_readmission_risk

router = APIRouter(prefix="/risk", tags=["risk-prediction"])

# All operational roles can read risk scores; researchers get this via
# aggregated dashboards instead (handled in the analytics module).
_readers = require_roles(Role.DOCTOR, Role.HOSPITAL_ADMIN, Role.SYSTEM_ADMIN)


@router.post("/predict/{admission_id}", response_model=RiskScoreOut)
def generate_risk_score(admission_id: uuid.UUID, db: Session = Depends(get_db), _=Depends(_readers)):
    admission = db.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    probability, category, model_version, confidence = predict_readmission_risk(admission)

    existing = db.query(RiskScore).filter(RiskScore.admission_id == admission_id).first()
    if existing:
        existing.readmission_probability = probability
        existing.risk_category = category
        existing.model_version = model_version
        existing.confidence_score = confidence
        score = existing
    else:
        score = RiskScore(
            patient_id=admission.patient_id,
            admission_id=admission_id,
            readmission_probability=probability,
            risk_category=category,
            model_version=model_version,
            confidence_score=confidence,
        )
        db.add(score)

    db.commit()
    db.refresh(score)
    return score


@router.get("/patient/{patient_id}", response_model=list[RiskScoreOut])
def get_patient_risk_history(patient_id: uuid.UUID, db: Session = Depends(get_db), _=Depends(_readers)):
    return db.query(RiskScore).filter(RiskScore.patient_id == patient_id).order_by(RiskScore.generated_at.desc()).all()


@router.get("/overview")
def risk_overview(db: Session = Depends(get_db), current_user=Depends(_readers)):
    """All risk scores in the caller's scope, newest first — powers the
    Risk Predictions dashboard page. Doctors are limited to their assigned
    patients; Hospital/System Admins see everything."""
    query = db.query(RiskScore).join(Patient, Patient.id == RiskScore.patient_id)

    if current_user.role == Role.DOCTOR.value:
        query = query.join(
            PatientAssignment,
            (PatientAssignment.patient_id == Patient.id) & (PatientAssignment.doctor_id == current_user.id),
        )

    scores = query.order_by(RiskScore.readmission_probability.desc()).limit(100).all()

    return [
        {
            "admission_id": str(s.admission_id),
            "patient_id": str(s.patient_id),
            "patient_name": s.patient.full_name,
            "patient_mrn": s.patient.mrn,
            "readmission_probability": s.readmission_probability,
            "risk_category": s.risk_category,
            "generated_at": s.generated_at.isoformat(),
        }
        for s in scores
    ]
