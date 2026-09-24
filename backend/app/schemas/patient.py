from datetime import date
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class PatientBase(BaseModel):
    mrn: str
    first_name: str
    last_name: str = ""
    gender: str
    age: int
    diagnosis: str | None = None
    department: str | None = None


class PatientCreate(PatientBase):
    admission_date: date | None = None


class PatientResponse(PatientBase):
    id: int
    admission_date: date | None = None
    risk_category: str | None = None
    risk_score: float | None = None

    model_config = ConfigDict(from_attributes=True)


class TimelineEvent(BaseModel):
    id: str
    event_type: str
    title: str
    timestamp: str
    icon: str
    description: str
    details: dict[str, Any] = {}