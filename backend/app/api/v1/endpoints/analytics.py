from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, require_roles
from app.models.user import User
from app.services.analytics_service import TreatmentAnalyticsService, HospitalPerformanceService
from app.schemas.analytics import (
    TreatmentSummaryResponse,
    MedicationOutcomesResponse,
    ChangeStatusOutcomesResponse,
    PolypharmacyOutcomesResponse,
    HospitalPerformanceResponse,
    AdmissionContextOutcomesResponse,
    UtilizationTrendsResponse,
    LengthOfStayOutcomesResponse
)

router = APIRouter()

ALLOWED_ROLES = [
    "Doctor",
    "Hospital Administrator",
    "Healthcare Researcher",
    "System Administrator"
]

@router.get("/treatment-summary", response_model=TreatmentSummaryResponse)
async def get_treatment_summary(
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve global treatment summary, medication usage prevalence, and regimen change statistics.
    """
    return TreatmentAnalyticsService.get_treatment_summary()

@router.get("/medication-outcomes", response_model=MedicationOutcomesResponse)
async def get_medication_outcomes(
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve 30-day readmission outcome rates across major diabetes medication groups and monotherapy vs combination therapy.
    """
    return TreatmentAnalyticsService.get_medication_outcomes()

@router.get("/change-status-outcomes", response_model=ChangeStatusOutcomesResponse)
async def get_change_status_outcomes(
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve readmission outcome rates stratified by medication regimen change (change = Ch vs No) and diabetesMed status.
    """
    return TreatmentAnalyticsService.get_change_status_outcomes()

@router.get("/polypharmacy-outcomes", response_model=PolypharmacyOutcomesResponse)
async def get_polypharmacy_outcomes(
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve readmission outcome rates stratified by inpatient polypharmacy (total medication count brackets).
    """
    return TreatmentAnalyticsService.get_polypharmacy_outcomes()

@router.get("/hospital-performance", response_model=HospitalPerformanceResponse)
async def get_hospital_performance(
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve aggregate system-level hospital performance KPIs, overall outcome distribution, and stay duration metrics across 130 US hospitals.
    """
    return HospitalPerformanceService.get_overall_performance()

@router.get("/admission-context-outcomes", response_model=AdmissionContextOutcomesResponse)
async def get_admission_context_outcomes(
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve readmission outcome rates stratified across admission types, admission sources, medical specialties, and primary ICD-9 diagnosis groups.
    """
    return HospitalPerformanceService.get_admission_context_outcomes()

@router.get("/utilization-trends", response_model=UtilizationTrendsResponse)
async def get_utilization_trends(
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve readmission risk trends stratified by prior 12-month inpatient, emergency, and outpatient hospital utilization.
    """
    return HospitalPerformanceService.get_utilization_trends()

@router.get("/length-of-stay-outcomes", response_model=LengthOfStayOutcomesResponse)
async def get_length_of_stay_outcomes(
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve readmission risk rates stratified across length of hospital stay duration brackets (Short, Moderate, Extended, Long).
    """
    return HospitalPerformanceService.get_length_of_stay_outcomes()
