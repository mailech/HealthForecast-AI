from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.patient import PatientResponse, PatientCreate, PatientUpdate
from app.services.patient_service import PatientService
from app.dependencies import RoleChecker

router = APIRouter(prefix="/patients", tags=["Patients Management"])

# RBAC permission groups
read_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]))
write_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "Hospital Administrator", "System Administrator"]))

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED, dependencies=[write_dependency])
def create_patient(patient_in: PatientCreate):
    """
    Registers a new patient.
    """
    patient = PatientService.create_patient(patient_in)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient with this patient_id already exists."
        )
    return patient

@router.get("", response_model=List[PatientResponse], dependencies=[read_dependency])
def list_patients(skip: int = 0, limit: int = 100):
    """
    Lists patients in the hospital registry.
    """
    return PatientService.get_patients(skip=skip, limit=limit)

@router.get("/{patient_id}", response_model=PatientResponse, dependencies=[read_dependency])
def get_patient(patient_id: str):
    """
    Retrieves patient details by database ID or custom patient_id.
    """
    patient = PatientService.get_by_id(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found."
        )
    return patient

@router.put("/{patient_id}", response_model=PatientResponse, dependencies=[write_dependency])
def update_patient(patient_id: str, patient_in: PatientUpdate):
    """
    Updates patient details.
    """
    patient = PatientService.update_patient(patient_id, patient_in)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or update failed."
        )
    return patient

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[write_dependency])
def delete_patient(patient_id: str):
    """
    Deletes patient record.
    """
    success = PatientService.delete_patient(patient_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or delete failed."
        )
