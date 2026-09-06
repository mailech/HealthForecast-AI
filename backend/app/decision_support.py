from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import require_role
from app import models

router = APIRouter(prefix="/decision-support", tags=["decision-support"])


class DecisionSupportInput(BaseModel):
    risk_category: str
    diagnosis: str


def build_recommendation(risk_category: str, diagnosis: str):
    if risk_category == "High":
        care_recommendation = f"High-risk patient with {diagnosis}. Recommend close monitoring and early intervention."
        follow_up = "Schedule follow-up within 7 days of discharge."
        risk_mitigation = "Consider home care nurse visit and medication review."
        discharge_support = "Delay discharge until vitals stable; arrange caregiver support at home."
    elif risk_category == "Medium":
        care_recommendation = f"Moderate-risk patient with {diagnosis}. Continue current treatment plan with regular review."
        follow_up = "Schedule follow-up within 14 days of discharge."
        risk_mitigation = "Review medication adherence and lifestyle factors."
        discharge_support = "Standard discharge protocol with follow-up call in 48 hours."
    else:
        care_recommendation = f"Low-risk patient with {diagnosis}. Routine care sufficient."
        follow_up = "Schedule routine follow-up within 30 days."
        risk_mitigation = "No additional mitigation needed at this time."
        discharge_support = "Standard discharge, no special arrangements needed."

    return {
        "care_recommendation": care_recommendation,
        "follow_up_plan": follow_up,
        "risk_mitigation": risk_mitigation,
        "discharge_support": discharge_support,
    }


@router.post("/recommend")
def recommend_care(
    data: DecisionSupportInput,
    current_user=Depends(require_role("doctor", "hospital_administrator", "system_admin")),
):
    return build_recommendation(data.risk_category, data.diagnosis)


def risk_category_from_treatments(treatments):
    outcomes = {t.outcome for t in treatments}
    if "Worsened" in outcomes:
        return "High"
    if "No Change" in outcomes:
        return "Medium"
    if "Improved" in outcomes:
        return "Low"
    return "Medium"


@router.get("/patient-recommendations")
def patient_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor", "hospital_administrator", "system_admin")),
):
    query = db.query(models.Patient)
    if current_user.role == "doctor":
        query = query.filter(models.Patient.assigned_doctor_id == current_user.id)

    patients = query.limit(10).all()

    results = []
    for patient in patients:
        treatments = db.query(models.Treatment).filter(
            models.Treatment.patient_id == patient.id
        ).all()
        risk_category = risk_category_from_treatments(treatments)
        recommendation = build_recommendation(risk_category, patient.diagnosis or "an unspecified condition")
        results.append({
            "patient_id": patient.id,
            "patient_name": patient.full_name,
            "risk_category": risk_category,
            **recommendation,
        })

    return results