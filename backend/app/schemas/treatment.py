from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TreatmentBase(BaseModel):
    patient_id: int
    admission_id: Optional[int] = None
    treatment_name: str
    treatment_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    prescribed_by: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None


class TreatmentCreate(TreatmentBase):
    pass


class TreatmentUpdate(BaseModel):
    treatment_name: Optional[str] = None
    treatment_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    prescribed_by: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None


class TreatmentResponse(TreatmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
