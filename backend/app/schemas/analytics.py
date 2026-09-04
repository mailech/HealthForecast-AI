from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date

# --- Treatment Evaluation & Recovery ---
class TreatmentEvaluationUpdate(BaseModel):
    outcome: str  # Recovered, Improved, Stable, Unchanged, Adverse Event
    recovery_score: Optional[int] = None  # 1-100 scale
    evaluation_notes: Optional[str] = None

class TreatmentEffectivenessSummary(BaseModel):
    treatment_type: str
    total_count: int
    success_rate: float
    recovered_count: int
    improved_count: int
    stable_count: int
    adverse_count: int
    avg_duration_days: float

class TreatmentEvaluationWorkflowItem(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    treatment_name: str
    treatment_type: Optional[str]
    prescribed_by: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    dosage: Optional[str]
    outcome: Optional[str]
    recovery_score: Optional[int]
    evaluation_notes: Optional[str]

class TreatmentEvaluationResponse(BaseModel):
    effectiveness_by_type: List[TreatmentEffectivenessSummary]
    overall_recovery_rate: float
    total_treatments_evaluated: int
    pending_evaluations_count: int
    treatments: List[TreatmentEvaluationWorkflowItem]


# --- Medication Outcome Analysis ---
class MedicationDetailOutcome(BaseModel):
    medication_name: str
    total_prescriptions: int
    efficacy_rate: float
    adverse_event_rate: float
    avg_treatment_days: float
    primary_condition: str

class MedicationSideEffectDistribution(BaseModel):
    side_effect: str
    count: int
    percentage: float

class MedicationOutcomeModuleData(BaseModel):
    medications: List[MedicationDetailOutcome]
    top_effective_medication: str
    overall_adherence_estimate: float
    side_effect_breakdown: List[MedicationSideEffectDistribution]


# --- Healthcare Performance Dashboard ---
class DepartmentPerformance(BaseModel):
    department: str
    admissions_count: int
    discharges_count: int
    avg_length_of_stay: float
    readmission_rate: float
    bed_occupancy_percentage: float

class PhysicianBenchmark(BaseModel):
    physician_name: str
    patients_handled: int
    avg_length_of_stay: float
    readmission_rate: float
    recovery_rate: float

class HealthcarePerformanceDashboardStats(BaseModel):
    total_patients: int
    active_admissions: int
    bed_occupancy_rate: float
    avg_length_of_stay: float
    readmission_rate: float
    patient_turnover_rate: float
    department_performance: List[DepartmentPerformance]
    physician_benchmarks: List[PhysicianBenchmark]


# --- Patient Outcome Analytics ---
class CohortOutcome(BaseModel):
    age_group: str
    total_patients: int
    recovery_rate: float
    readmission_rate: float

class OutcomeDistribution(BaseModel):
    outcome_status: str
    count: int
    percentage: float

class PatientOutcomeAnalyticsReport(BaseModel):
    total_outcomes_analyzed: int
    readmission_within_30_days: int
    readmission_rate_30_days: float
    outcome_distribution: List[OutcomeDistribution]
    cohort_analytics: List[CohortOutcome]
    risk_vs_outcome_accuracy: float


# --- Healthcare Trend Monitoring ---
class TimeSeriesPoint(BaseModel):
    period: str  # Month or Date string e.g. "2026-01"
    admissions: int
    discharges: int
    readmissions: int
    readmission_rate: float
    treatment_success_rate: float

class DiseasePrevalenceTrend(BaseModel):
    condition: str
    count: int
    trend_direction: str  # 'Increasing', 'Decreasing', 'Stable'

class HealthcareTrendMonitoringData(BaseModel):
    timeframe: str  # '30D', '90D', '6M', '1Y'
    trend_series: List[TimeSeriesPoint]
    disease_trends: List[DiseasePrevalenceTrend]
    projected_risk_level: str
    emerging_risk_alerts: List[str]
