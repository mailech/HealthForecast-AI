from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class PatientBase(BaseModel):
    patient_nbr: str
    gender: Optional[str] = "Unknown/Invalid"
    age_group: Optional[str] = "[50-60)"
    race: Optional[str] = "Caucasian"
    weight_group: Optional[str] = "?"

class PatientCreate(PatientBase):
    pass

class PatientRead(PatientBase):
    id: int
    created_at: datetime
    encounter_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)
