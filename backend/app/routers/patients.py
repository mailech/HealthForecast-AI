from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud, models
from ..auth import get_current_user, require_roles


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


# ============================================================
# GET ALL PATIENTS
# ============================================================

@router.get("/", response_model=list[schemas.PatientResponse])
def get_all_patients(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role in ["admin", "doctor", "staff"]:
        return crud.get_patients(db)

    if current_user.role == "patient":
        patient = (
            db.query(models.Patient)
            .filter(models.Patient.user_id == current_user.id)
            .first()
        )

        if not patient:
            return []

        return [patient]

    raise HTTPException(
        status_code=403,
        detail="You do not have permission to access patients"
    )


# ============================================================
# RESEARCH COHORT DATA
# AGGREGATE DATA ONLY - NO NAME OR PATIENT ID
# ============================================================

@router.get("/research/cohort")
def get_research_cohort(
    current_user=Depends(
        require_roles(
            "admin",
            "doctor",
            "researcher"
        )
    ),
    db: Session = Depends(get_db)
):
    patients = db.query(models.Patient).all()

    return [
        {
            "age": patient.age,
            "gender": patient.gender,
            "disease": patient.disease,
            "risk": patient.risk,
            "status": patient.status,
        }
        for patient in patients
    ]


# ============================================================
# GET SINGLE PATIENT
# ============================================================

@router.get("/{patient_id}", response_model=schemas.PatientResponse)
def get_single_patient(
    patient_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = crud.get_patient(db, patient_id)

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    if current_user.role in ["admin", "doctor", "staff"]:
        return patient

    if current_user.role == "patient":
        if patient.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only access your own patient record"
            )

        return patient

    raise HTTPException(
        status_code=403,
        detail="You do not have permission to access this patient"
    )


# ============================================================
# CREATE PATIENT
# ADMIN + DOCTOR ONLY
# ============================================================

@router.post("/", response_model=schemas.PatientResponse)
def create_patient(
    patient: schemas.PatientCreate,
    current_user=Depends(
        require_roles(
            "admin",
            "doctor"
        )
    ),
    db: Session = Depends(get_db)
):
    return crud.create_patient(db, patient)


# ============================================================
# UPDATE PATIENT
# ADMIN + DOCTOR ONLY
# ============================================================

@router.put("/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(
    patient_id: int,
    patient: schemas.PatientUpdate,
    current_user=Depends(
        require_roles(
            "admin",
            "doctor"
        )
    ),
    db: Session = Depends(get_db)
):
    updated_patient = crud.update_patient(
        db,
        patient_id,
        patient
    )

    if not updated_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return updated_patient


# ============================================================
# DELETE PATIENT
# ADMIN ONLY
# ============================================================

@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    current_user=Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):
    deleted_patient = crud.delete_patient(
        db,
        patient_id
    )

    if not deleted_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return {
        "message": "Patient deleted successfully"
    } 