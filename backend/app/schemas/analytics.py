from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_patients: int = 0
    total_predictions: int = 0
    high_risk_patients: int = 0
    average_risk_score: float = 0.0
    readmission_rate: float = 0.0
    risk_distribution: list[dict[str, int | str]] = []
    recent_predictions: list[dict[str, object]] = []
    appointments_today: int = 0


class HospitalOperationsSummary(BaseModel):
    total_patients: int = 0
    todays_appointments: int = 0
    pending_appointments: int = 0
    completed_appointments: int = 0
    missed_appointments: int = 0


class PatientFlowMetrics(BaseModel):
    period: str
    registered_patients: int = 0
    total_appointments: int = 0
    completed_appointments: int = 0
    pending_appointments: int = 0
    missed_appointments: int = 0


class DepartmentWorkloadItem(BaseModel):
    name: str
    patient_count: int = 0
    appointment_count: int = 0
    total_workload: int = 0


class PatientRiskOverview(BaseModel):
    high_risk: int = 0
    medium_risk: int = 0
    low_risk: int = 0
    total_evaluated: int = 0


class HospitalOperationsResponse(BaseModel):
    summary: HospitalOperationsSummary
    patient_flow: PatientFlowMetrics
    department_workload: list[DepartmentWorkloadItem]
    risk_overview: PatientRiskOverview