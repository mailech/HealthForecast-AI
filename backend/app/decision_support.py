from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.security import require_role

router = APIRouter(prefix="/decision-support", tags=["decision-support"])


class DecisionSupportInput(BaseModel):
    risk_category: str
    diagnosis: str


@router.post("/recommend")
def recommend_care(
    data: DecisionSupportInput,
    current_user=Depends(require_role("doctor", "hospital_administrator", "system_admin")),
):
    if data.risk_category == "High":
        care_recommendation = f"High-risk patient with {data.diagnosis}. Recommend close monitoring and early intervention."
        follow_up = "Schedule follow-up within 7 days of discharge."
        risk_mitigation = "Consider home care nurse visit and medication review."
        discharge_support = "Delay discharge until vitals stable; arrange caregiver support at home."
    elif data.risk_category == "Medium":
        care_recommendation = f"Moderate-risk patient with {data.diagnosis}. Continue current treatment plan with regular review."
        follow_up = "Schedule follow-up within 14 days of discharge."
        risk_mitigation = "Review medication adherence and lifestyle factors."
        discharge_support = "Standard discharge protocol with follow-up call in 48 hours."
    else:
        care_recommendation = f"Low-risk patient with {data.diagnosis}. Routine care sufficient."
        follow_up = "Schedule routine follow-up within 30 days."
        risk_mitigation = "No additional mitigation needed at this time."
        discharge_support = "Standard discharge, no special arrangements needed."

    return {
        "care_recommendation": care_recommendation,
        "follow_up_plan": follow_up,
        "risk_mitigation": risk_mitigation,
        "discharge_support": discharge_support,
    }