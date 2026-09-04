from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_patients: int
    total_admissions: int
    total_discharges: int
    high_risk_patients: int
    readmission_rate: float
    active_admissions: int
