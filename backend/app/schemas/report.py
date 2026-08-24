from datetime import datetime

from pydantic import BaseModel


class ReportResponse(BaseModel):
    patient_id: int
    patient_name: str
    mrn: str
    age: int
    gender: str
    admission_date: str | None
    prediction_id: int | None
    risk_score: float | None
    risk_category: str | None
    model_version: str | None
    prediction_date: datetime | None
    summary: str
    insights: list[str]
