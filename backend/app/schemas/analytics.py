from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CohortOutcomeMetric(BaseModel):
    cohort_name: str = Field(..., description="Name of the treatment or demographic cohort")
    sample_size: int = Field(..., description="Sample size (count of valid encounters, n)")
    cohort_percentage: float = Field(..., description="Percentage of total dataset encounters (%)")
    early_readmit_count: int = Field(..., description="Count of 30-day early readmissions (<30)")
    early_readmit_rate: float = Field(..., description="30-day early readmission rate (%)")
    late_readmit_rate: float = Field(..., description="30-day+ late readmission rate (%)")
    no_readmit_rate: float = Field(..., description="No readmission rate (%)")
    relative_risk_vs_baseline: float = Field(..., description="Ratio of cohort early readmission rate to baseline (11.19%)")

class TopMedicationPrevalence(BaseModel):
    medication_name: str
    user_count: int
    prevalence_percentage: float

class PrescribedStat(BaseModel):
    count: int
    percentage: float

class TreatmentSummaryResponse(BaseModel):
    total_encounters_analyzed: int
    diabetes_med_prescribed: PrescribedStat
    regimen_changed: PrescribedStat
    top_prescribed_medications: List[TopMedicationPrevalence]
    disclaimer: str

class MedicationOutcomesResponse(BaseModel):
    baseline_readmission_rate_30d: float = 11.19
    cohort_outcomes: List[CohortOutcomeMetric]
    disclaimer: str

class ChangeStatusOutcomesResponse(BaseModel):
    baseline_readmission_rate_30d: float = 11.19
    cohort_outcomes: List[CohortOutcomeMetric]
    disclaimer: str

class PolypharmacyOutcomesResponse(BaseModel):
    baseline_readmission_rate_30d: float = 11.19
    cohort_outcomes: List[CohortOutcomeMetric]
    disclaimer: str

class OutcomeStat(BaseModel):
    count: int
    percentage: float

class OutcomeDistributionStat(BaseModel):
    early_readmission: OutcomeStat
    late_readmission: OutcomeStat
    no_readmission: OutcomeStat

class HospitalPerformanceResponse(BaseModel):
    total_encounters_analyzed: int
    eligible_encounters_count: int
    early_readmit_count: int
    early_readmit_rate_pct: float
    late_readmit_rate_pct: float
    no_readmit_rate_pct: float
    overall_outcome_distribution: Optional[OutcomeDistributionStat] = None
    average_length_of_stay_days: float
    high_utilization_patient_pct: float
    extended_stay_rate_pct: float
    dataset_hospital_system_count: int
    dataset_time_span: str
    hospital_anonymity_disclaimer: str
    disclaimer: str

class AdmissionContextOutcomesResponse(BaseModel):
    baseline_readmission_rate_30d: float = 11.19
    cohort_outcomes: List[CohortOutcomeMetric]
    hospital_anonymity_disclaimer: str
    disclaimer: str

class UtilizationTrendsResponse(BaseModel):
    baseline_readmission_rate_30d: float = 11.19
    cohort_outcomes: List[CohortOutcomeMetric]
    hospital_anonymity_disclaimer: str
    disclaimer: str

class LengthOfStayOutcomesResponse(BaseModel):
    baseline_readmission_rate_30d: float = 11.19
    cohort_outcomes: List[CohortOutcomeMetric]
    hospital_anonymity_disclaimer: str
    disclaimer: str
