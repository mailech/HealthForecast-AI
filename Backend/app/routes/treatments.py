from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.treatment import TreatmentResponse, TreatmentCreate, TreatmentUpdate
from app.services.treatment_service import TreatmentService
from app.dependencies import RoleChecker

router = APIRouter(prefix="/treatments", tags=["Treatments Management"])

read_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]))
write_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "System Administrator"]))

@router.post("", response_model=TreatmentResponse, status_code=status.HTTP_201_CREATED, dependencies=[write_dependency])
def create_treatment(treatment_in: TreatmentCreate):
    """
    Establishes a new treatment plan or medication schedule for a patient.
    """
    treatment = TreatmentService.create_treatment(treatment_in)
    if not treatment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient does not exist or treatment cannot be created."
        )
    return treatment

@router.get("", response_model=List[TreatmentResponse], dependencies=[read_dependency])
def list_treatments(skip: int = 0, limit: int = 100):
    """
    Lists treatment plans.
    """
    return TreatmentService.get_all_treatments(skip=skip, limit=limit)

@router.get("/patient/{patient_id}", response_model=List[TreatmentResponse], dependencies=[read_dependency])
def get_patient_treatments(patient_id: str):
    """
    Retrieves all treatment schedules for a specific patient.
    """
    return TreatmentService.get_by_patient_id(patient_id)

@router.get("/{treatment_id}", response_model=TreatmentResponse, dependencies=[read_dependency])
def get_treatment(treatment_id: str):
    """
    Retrieves a treatment plan record by ID.
    """
    treatment = TreatmentService.get_by_id(treatment_id)
    if not treatment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treatment plan not found."
        )
    return treatment

@router.put("/{treatment_id}", response_model=TreatmentResponse, dependencies=[write_dependency])
def update_treatment(treatment_id: str, treatment_in: TreatmentUpdate):
    """
    Updates a treatment plan status or medications.
    """
    treatment = TreatmentService.update_treatment(treatment_id, treatment_in)
    if not treatment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treatment plan not found or update failed."
        )
    return treatment

@router.delete("/{treatment_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[write_dependency])
def delete_treatment(treatment_id: str):
    """
    Deletes a treatment plan.
    """
    success = TreatmentService.delete_treatment(treatment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Treatment plan not found or delete failed."
        )
