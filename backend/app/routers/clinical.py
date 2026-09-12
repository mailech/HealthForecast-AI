from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, require_roles


router = APIRouter(
    prefix="/clinical",
    tags=["Clinical Analytics"]
)


def get_patient(
    patient_id: int,
    current_user,
    db: Session
):
    patient = (
        db.query(models.Patient)
        .filter(models.Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    if (
        current_user.role == "patient"
        and patient.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only access your own record"
        )

    return patient


# Treatment effectiveness

@router.get("/treatments")
def get_treatments(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.TreatmentRecord)

    if current_user.role == "patient":
        patient = (
            db.query(models.Patient)
            .filter(
                models.Patient.user_id == current_user.id
            )
            .first()
        )

        if not patient:
            return {
                "average_effectiveness": 0,
                "records": []
            }

        query = query.filter(
            models.TreatmentRecord.patient_id == patient.id
        )

    records = query.all()

    average = (
        sum(r.effectiveness_score for r in records) / len(records)
        if records else 0
    )

    return {
        "average_effectiveness": round(average, 2),
        "records": records
    }


@router.post(
    "/treatments",
    response_model=schemas.TreatmentResponse
)
def create_treatment(
    data: schemas.TreatmentCreate,
    current_user=Depends(
        require_roles("admin", "doctor")
    ),
    db: Session = Depends(get_db)
):
    get_patient(
        data.patient_id,
        current_user,
        db
    )

    record = models.TreatmentRecord(
        patient_id=data.patient_id,
        treatment_name=data.treatment_name,
        outcome=data.outcome,
        effectiveness_score=data.effectiveness_score,
        notes=data.notes,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# Medication effectiveness

@router.get("/medications")
def get_medications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.MedicationRecord)

    if current_user.role == "patient":
        patient = (
            db.query(models.Patient)
            .filter(
                models.Patient.user_id == current_user.id
            )
            .first()
        )

        if not patient:
            return {
                "average_effectiveness": 0,
                "records": []
            }

        query = query.filter(
            models.MedicationRecord.patient_id == patient.id
        )

    records = query.all()

    average = (
        sum(r.effectiveness_score for r in records) / len(records)
        if records else 0
    )

    return {
        "average_effectiveness": round(average, 2),
        "records": records
    }


@router.post(
    "/medications",
    response_model=schemas.MedicationResponse
)
def create_medication(
    data: schemas.MedicationCreate,
    current_user=Depends(
        require_roles("admin", "doctor")
    ),
    db: Session = Depends(get_db)
):
    get_patient(
        data.patient_id,
        current_user,
        db
    )

    record = models.MedicationRecord(
        patient_id=data.patient_id,
        medication_name=data.medication_name,
        outcome=data.outcome,
        effectiveness_score=data.effectiveness_score,
        notes=data.notes,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# Recovery analysis

@router.get("/recovery")
def get_recovery(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.RecoveryRecord)

    if current_user.role == "patient":
        patient = (
            db.query(models.Patient)
            .filter(
                models.Patient.user_id == current_user.id
            )
            .first()
        )

        if not patient:
            return {
                "average_recovery_score": 0,
                "average_days_to_recovery": 0,
                "records": []
            }

        query = query.filter(
            models.RecoveryRecord.patient_id == patient.id
        )

    records = query.all()

    avg_score = (
        sum(r.recovery_score for r in records) / len(records)
        if records else 0
    )

    days = [
        r.days_to_recovery
        for r in records
        if r.days_to_recovery is not None
    ]

    avg_days = (
        sum(days) / len(days)
        if days else 0
    )

    return {
        "average_recovery_score": round(avg_score, 2),
        "average_days_to_recovery": round(avg_days, 2),
        "records": records
    }


@router.post(
    "/recovery",
    response_model=schemas.RecoveryResponse
)
def create_recovery(
    data: schemas.RecoveryCreate,
    current_user=Depends(
        require_roles("admin", "doctor")
    ),
    db: Session = Depends(get_db)
):
    get_patient(
        data.patient_id,
        current_user,
        db
    )

    record = models.RecoveryRecord(
        patient_id=data.patient_id,
        recovery_stage=data.recovery_stage,
        recovery_score=data.recovery_score,
        days_to_recovery=data.days_to_recovery,
        notes=data.notes,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record