from datetime import datetime
from pydantic import BaseModel


class TreatmentInfo(BaseModel):
    diagnosis: str | None = None
    treatment_plan: str | None = None


class AppointmentInfo(BaseModel):
    id: int
    doctor_name: str | None = None
    appointment_date: str
    appointment_time: str
    status: str
    reminder_timing: str | None = None


class ReportResponse(BaseModel):
    patient_id: int
    patient_name: str
    first_name: str | None = None
    last_name: str | None = None
    mrn: str
    age: int
    gender: str
    diagnosis: str | None = None
    department: str | None = None
    admission_date: str | None = None
    prediction_id: int | None = None
    risk_score: float | None = None
    risk_category: str | None = None
    model_version: str | None = None
    prediction_date: datetime | None = None
    summary: str
    insights: list[str] = []
    treatment: TreatmentInfo | None = None
    appointments: list[AppointmentInfo] = []
