from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


@router.get(
    "",
    response_model=list[schemas.PatientResponse],
)
def get_all_patients(
    db: Session = Depends(get_db),
):
    return crud.get_patients(db)


@router.get(
    "/{patient_id}",
    response_model=schemas.PatientResponse,
)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
):
    patient = crud.get_patient(
        db,
        patient_id,
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    return patient


@router.post(
    "",
    response_model=schemas.PatientResponse,
)
def create_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(get_db),
):
    return crud.create_patient(
        db,
        patient,
    )


@router.put(
    "/{patient_id}",
    response_model=schemas.PatientResponse,
)
def update_patient(
    patient_id: int,
    patient: schemas.PatientUpdate,
    db: Session = Depends(get_db),
):
    db_patient = crud.get_patient(
        db,
        patient_id,
    )

    if not db_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    return crud.update_patient(
        db,
        db_patient,
        patient,
    )


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
):
    db_patient = crud.get_patient(
        db,
        patient_id,
    )

    if not db_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    crud.delete_patient(
        db,
        db_patient,
    )

    return {
        "message": "Patient deleted successfully"
    }