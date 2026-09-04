from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MedicalHistoryBase(BaseModel):
    patient_id: int
    condition: str
    diagnosis_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class MedicalHistoryCreate(MedicalHistoryBase):
    pass


class MedicalHistoryUpdate(BaseModel):
    condition: Optional[str] = None
    diagnosis_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class MedicalHistoryResponse(MedicalHistoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
