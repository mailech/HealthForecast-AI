from typing import List
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.history import MedicalHistoryResponse, MedicalHistoryCreate, MedicalHistoryUpdate
from app.services.history_service import MedicalHistoryService
from app.dependencies import RoleChecker

router = APIRouter(prefix="/history", tags=["Medical Histories"])

read_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]))
write_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "Hospital Administrator", "System Administrator"]))

@router.post("", response_model=MedicalHistoryResponse, status_code=status.HTTP_201_CREATED, dependencies=[write_dependency])
def create_medical_history(history_in: MedicalHistoryCreate):
    """
    Creates a new medical history record linked to an existing patient.
    """
    history = MedicalHistoryService.create_history(history_in)
    if not history:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient does not exist or history cannot be added."
        )
    return history

@router.get("", response_model=List[MedicalHistoryResponse], dependencies=[read_dependency])
def list_histories(skip: int = 0, limit: int = 100):
    """
    Lists medical history records in the system.
    """
    return MedicalHistoryService.get_all_histories(skip=skip, limit=limit)

@router.get("/patient/{patient_id}", response_model=List[MedicalHistoryResponse], dependencies=[read_dependency])
def get_patient_histories(patient_id: str):
    """
    Retrieves all medical history records associated with a specific patient.
    """
    return MedicalHistoryService.get_by_patient_id(patient_id)

@router.get("/{history_id}", response_model=MedicalHistoryResponse, dependencies=[read_dependency])
def get_history(history_id: str):
    """
    Retrieves a single medical history record by ID.
    """
    history = MedicalHistoryService.get_by_id(history_id)
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical history record not found."
        )
    return history

@router.put("/{history_id}", response_model=MedicalHistoryResponse, dependencies=[write_dependency])
def update_history(history_id: str, history_in: MedicalHistoryUpdate):
    """
    Updates a medical history record.
    """
    history = MedicalHistoryService.update_history(history_id, history_in)
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical history record not found or update failed."
        )
    return history

@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[write_dependency])
def delete_history(history_id: str):
    """
    Deletes a medical history record.
    """
    success = MedicalHistoryService.delete_history(history_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical history record not found or delete failed."
        )
