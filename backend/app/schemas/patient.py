from datetime import date
from pydantic import BaseModel, ConfigDict


class PatientBase(BaseModel):
    mrn: str
    first_name: str
    last_name: str
    gender: str
    age: int


class PatientCreate(PatientBase):
    admission_date: date | None = None


class PatientResponse(PatientBase):
    id: int
    admission_date: date | None = None

    model_config = ConfigDict(from_attributes=True)