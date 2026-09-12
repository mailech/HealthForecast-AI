from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..auth import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ============================================================
# GET NOTIFICATIONS
# ============================================================

@router.get("/")
def get_notifications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = []

    # ========================================================
    # STAFF / DOCTOR / ADMIN
    # Can see hospital-wide alerts
    # ========================================================

    if current_user.role in [
        "admin",
        "doctor",
        "staff"
    ]:

        patients = (
            db.query(models.Patient)
            .order_by(
                models.Patient.created_at.desc()
            )
            .all()
        )

    # ========================================================
    # PATIENT
    # Can only see alerts related to own record
    # ========================================================

    elif current_user.role == "patient":

        patients = (
            db.query(models.Patient)
            .filter(
                models.Patient.user_id ==
                current_user.id
            )
            .order_by(
                models.Patient.created_at.desc()
            )
            .all()
        )

    else:
        patients = []


    # ========================================================
    # BUILD NOTIFICATIONS
    # ========================================================

    for patient in patients:

        # ----------------------------------------------------
        # HIGH RISK PATIENT
        # ----------------------------------------------------

        if patient.risk == "High":

            notifications.append({
                "id": f"risk-{patient.id}",
                "type": "high_risk",
                "title": "High Risk Patient",
                "message": (
                    f"Patient {patient.name} "
                    f"(P-{patient.id:04d}) has high "
                    f"readmission risk."
                ),
                "patient_id": patient.id,
                "created_at": patient.created_at,
            })


        # ----------------------------------------------------
        # NEW ADMISSION
        # ----------------------------------------------------

        if patient.admission_date:

            notifications.append({
                "id": f"admission-{patient.id}",
                "type": "new_admission",
                "title": "New Admission",
                "message": (
                    f"Patient {patient.name} "
                    f"(P-{patient.id:04d}) has been admitted."
                ),
                "patient_id": patient.id,
                "created_at": patient.created_at,
            })


    # ========================================================
    # SORT LATEST FIRST
    # ========================================================

    notifications.sort(
        key=lambda item: (
            item["created_at"] is not None,
            item["created_at"]
        ),
        reverse=True
    )


    # ========================================================
    # RETURN
    # ========================================================

    return {
        "count": len(notifications),
        "notifications": notifications
    }