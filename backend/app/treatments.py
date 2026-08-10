from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional

from app.database import get_db
from app.security import get_current_user, require_role
from app import models

router = APIRouter(prefix="/treatments", tags=["treatments"])


class TreatmentCreate(BaseModel):
    patient_id: int
    treatment_name: str
    medication: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None


@router.post("/")
def create_treatment(
    treatment: TreatmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor", "system_admin")),
):
    new_treatment = models.Treatment(**treatment.dict())
    db.add(new_treatment)
    db.commit()
    db.refresh(new_treatment)
    return new_treatment


@router.get("/")
def list_treatments(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor", "hospital_administrator", "healthcare_researcher", "system_admin")),
):
    return db.query(models.Treatment).all()


@router.get("/effectiveness-summary")
def treatment_effectiveness_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor", "hospital_administrator", "healthcare_researcher", "system_admin")),
):
    treatments = db.query(models.Treatment).all()
    total = len(treatments)
    improved = len([t for t in treatments if t.outcome == "Improved"])
    no_change = len([t for t in treatments if t.outcome == "No Change"])
    worsened = len([t for t in treatments if t.outcome == "Worsened"])

    return {
        "total_treatments": total,
        "improved": improved,
        "no_change": no_change,
        "worsened": worsened,
        "improvement_rate": round(improved / total, 2) if total > 0 else 0,
    }

 