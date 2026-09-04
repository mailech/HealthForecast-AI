from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class AdmissionBase(BaseModel):
    patient_id: int
    admission_number: str
    admission_date: date
    discharge_date: Optional[date] = None
    admission_type: Optional[str] = None
    department: Optional[str] = None
    room_number: Optional[str] = None
    attending_physician: Optional[str] = None
    diagnosis: Optional[str] = None
    discharge_diagnosis: Optional[str] = None
    length_of_stay: Optional[int] = None
    readmission_flag: Optional[str] = "No"
    readmission_reason: Optional[str] = None


class AdmissionCreate(AdmissionBase):
    pass


class AdmissionUpdate(BaseModel):
    discharge_date: Optional[date] = None
    admission_type: Optional[str] = None
    department: Optional[str] = None
    room_number: Optional[str] = None
    attending_physician: Optional[str] = None
    diagnosis: Optional[str] = None
    discharge_diagnosis: Optional[str] = None
    length_of_stay: Optional[int] = None
    readmission_flag: Optional[str] = None
    readmission_reason: Optional[str] = None


class AdmissionResponse(AdmissionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
