from pydantic import BaseModel
from typing import List, Dict, Any

class DashboardStats(BaseModel):
    total_patients: int
    assigned_patients: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    readmission_rate_30_days: float
    readmission_rate_over_30_days: float
    avg_stay_days: float

class ReadmissionOverview(BaseModel):
    category: str
    count: int
    percentage: float

class DemographicsItem(BaseModel):
    label: str
    count: int

class TrendItem(BaseModel):
    date: str
    total_admissions: int
    readmissions: int

class DiagnosisItem(BaseModel):
    diagnosis: str
    count: int

class HospitalPerformance(BaseModel):
    department: str
    total_patients: int
    avg_days_in_hospital: float
    readmission_rate: float
    high_risk_percentage: float
