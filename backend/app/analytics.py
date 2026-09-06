from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import require_role
from app import models

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor", "hospital_administrator", "system_admin", "healthcare_researcher")),
):
    total_patients = db.query(models.Patient).count()
    total_treatments = db.query(models.Treatment).count()

    treatments = db.query(models.Treatment).all()
    improved = len([t for t in treatments if t.outcome == "Improved"])
    no_change = len([t for t in treatments if t.outcome == "No Change"])
    worsened = len([t for t in treatments if t.outcome == "Worsened"])

    # Distinct patients with at least one "Worsened" treatment outcome
    # are treated as a proxy for high-risk / at-risk-of-readmission patients.
    worsened_patient_ids = {t.patient_id for t in treatments if t.outcome == "Worsened"}
    high_risk_patients = len(worsened_patient_ids)
    readmission_rate = (
        round((high_risk_patients / total_patients) * 100, 1)
        if total_patients > 0 else 0
    )

    diagnosis_counts = {}
    for p in db.query(models.Patient).all():
        if p.diagnosis:
            diagnosis_counts[p.diagnosis] = diagnosis_counts.get(p.diagnosis, 0) + 1

    return {
        "total_patients": total_patients,
        "total_treatments": total_treatments,
        "high_risk_patients": high_risk_patients,
        "readmission_rate": readmission_rate,
        "treatment_outcomes": {
            "improved": improved,
            "no_change": no_change,
            "worsened": worsened,
        },
        "diagnosis_breakdown": diagnosis_counts,
    }