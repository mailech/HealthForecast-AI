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

class TreatmentRegimenEfficacy(BaseModel):
    regimen_name: str
    patient_count: int
    readmission_rate_30d: float
    avg_stay_days: float
    glycemic_control_rate: float
    relative_risk_reduction: float
    efficacy_rating: str

class DosageAdjustmentImpact(BaseModel):
    adjustment_type: str
    patient_count: int
    readmission_rate: float
    clinical_insight: str

class TreatmentEffectivenessResponse(BaseModel):
    regimens: List[TreatmentRegimenEfficacy]
    dosage_impacts: List[DosageAdjustmentImpact]
    summary: Dict[str, Any]

class SurvivalPoint(BaseModel):
    day: int
    high_risk: float
    medium_risk: float
    low_risk: float

class ComorbidityHazardItem(BaseModel):
    comorbidity: str
    icd9_range: str
    patient_count: int
    readmission_rate: float
    hazard_ratio: float
    risk_level: str

class SpecialtyQualityItem(BaseModel):
    specialty: str
    patient_count: int
    observed_rate: float
    expected_rate: float
    oe_ratio: float
    quality_tier: str

class LongitudinalRiskItem(BaseModel):
    encounter_step: str
    avg_risk_score: float
    patient_count: int

class AdvancedAnalyticsResponse(BaseModel):
    survival_curve: List[SurvivalPoint]
    comorbidity_hazards: List[ComorbidityHazardItem]
    specialty_quality: List[SpecialtyQualityItem]
    longitudinal_trajectories: List[LongitudinalRiskItem]
    insights: Dict[str, Any]


