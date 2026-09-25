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


# ============================================================
# RESEARCHER ROLE SCHEMAS
# ============================================================
class ResearchCohortFilter(BaseModel):
    age_group: str | None = "all"
    gender: str | None = "all"
    department: str | None = "all"
    diagnosis: str | None = None
    risk_level: str | None = "all"
    prediction_status: str | None = "all"
    date_start: str | None = None
    date_end: str | None = None
    min_prior_admissions: int | None = None
    min_length_of_stay: int | None = None
    trend_granularity: str | None = "week"


class ResearcherKpis(BaseModel):
    total_cohort: int = 0
    total_predictions: int = 0
    high_risk_patients: int = 0
    medium_risk_patients: int = 0
    low_risk_patients: int = 0
    not_predicted_patients: int = 0
    average_risk_score: float | None = None
    readmission_rate: float = 0.0
    avg_length_of_stay: float | None = None
    avg_prior_admissions: float | None = None


class PopulationAgeItem(BaseModel):
    age: str
    count: int = 0
    readmitted: int = 0


class TrendPointItem(BaseModel):
    period: str
    avg_risk: float = 0.0
    predictions: int = 0
    readmission_count: int = 0


class AnonymizedPatientItem(BaseModel):
    anonymized_id: str
    age: int
    age_group: str
    gender: str
    department: str | None = None
    diagnosis: str | None = None
    prior_admissions: int | None = None
    length_of_stay: int | None = None
    risk_score: float | None = None
    risk_level: str | None = None
    prediction_date: str | None = None
    readmission_status: str = "Not Readmitted"


class ResearcherAnalyticsResponse(BaseModel):
    kpis: ResearcherKpis
    population_by_age: list[PopulationAgeItem]
    risk_distribution: list[dict[str, int | str]]
    population_stats_table: list[PopulationAgeItem]
    trend_data: list[TrendPointItem]
    insufficient_trend_data: bool = False
    patient_list: list[AnonymizedPatientItem]


class CohortComparisonRequest(BaseModel):
    cohort_a: ResearchCohortFilter
    cohort_b: ResearchCohortFilter


class CohortComparisonResponse(BaseModel):
    cohort_a_name: str
    cohort_a_metrics: ResearcherKpis
    cohort_b_name: str
    cohort_b_metrics: ResearcherKpis