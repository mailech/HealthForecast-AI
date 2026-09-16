import io
import csv
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np

from app.api.deps import require_roles
from app.models.user import User
from app.services.analytics_service import (
    load_analytics_dataframe,
    calculate_cohort_metrics,
    map_icd9_category,
    TreatmentAnalyticsService,
    HospitalPerformanceService,
    ANALYTICS_DISCLAIMER
)

router = APIRouter()

class ResearcherCohortFilterRequest(BaseModel):
    age_group: Optional[str] = None
    gender: Optional[str] = None
    race: Optional[str] = None
    medical_specialty: Optional[str] = None
    admission_type: Optional[str] = None
    primary_diagnosis: Optional[str] = None
    diabetes_med: Optional[str] = None
    change_status: Optional[str] = None
    readmission_category: Optional[str] = None
    min_medications: Optional[int] = Field(None, ge=1, le=100)
    max_medications: Optional[int] = Field(None, ge=1, le=100)

class ReportExportRequest(BaseModel):
    report_type: str = Field(..., description="treatment_effectiveness, readmission_trends, population_health, patient_outcomes, aggregated_analytics")

PROHIBITED_IDENTIFIER_COLUMNS = {'patient_nbr', 'encounter_id', 'id', 'created_at', 'updated_at', 'ssn', 'name', 'email', 'phone'}

@router.get("/anonymized-patients")
async def get_anonymized_patient_cohorts(
    current_user: User = Depends(require_roles(["Healthcare Researcher", "System Administrator"]))
):
    """
    Retrieve anonymized, aggregated patient population cohort distributions.
    Strictly excludes direct patient identifiers (patient_nbr, encounter_id, PII).
    """
    df = load_analytics_dataframe()
    total_n = len(df)

    # 1. Age Group Distributions
    age_counts = df['age'].value_counts().to_dict()
    age_dist = [
        {"cohort_name": k, "sample_size": int(v), "cohort_percentage": round((v / total_n) * 100, 2)}
        for k, v in age_counts.items()
    ]

    # 2. Gender Distributions
    gender_counts = df['gender'].value_counts().to_dict()
    gender_dist = [
        {"cohort_name": k, "sample_size": int(v), "cohort_percentage": round((v / total_n) * 100, 2)}
        for k, v in gender_counts.items()
    ]

    # 3. Race Categories
    race_counts = df['race'].replace('?', 'Unspecified').value_counts().to_dict()
    race_dist = [
        {"cohort_name": k, "sample_size": int(v), "cohort_percentage": round((v / total_n) * 100, 2)}
        for k, v in race_counts.items()
    ]

    # 4. Primary Diagnosis Categories
    df_diag = df.copy()
    df_diag['diag_1_group'] = df_diag['diag_1'].apply(map_icd9_category)
    diag_counts = df_diag['diag_1_group'].value_counts().to_dict()
    diag_dist = [
        {"cohort_name": k, "sample_size": int(v), "cohort_percentage": round((v / total_n) * 100, 2)}
        for k, v in diag_counts.items()
    ]

    # 5. Readmission Categories
    readmit_counts = df['readmitted'].value_counts().to_dict()
    readmit_dist = [
        {"cohort_name": k, "sample_size": int(v), "cohort_percentage": round((v / total_n) * 100, 2)}
        for k, v in readmit_counts.items()
    ]

    return {
        "anonymized_scope": "Population-Level Retrospective Research Cohorts (No PII)",
        "total_eligible_encounters": total_n,
        "age_distribution": age_dist,
        "gender_distribution": gender_dist,
        "race_distribution": race_dist,
        "diagnosis_distribution": diag_dist,
        "readmission_distribution": readmit_dist,
        "privacy_notice": "Strictly anonymized aggregate research payload. Patient identifiers (patient_nbr, encounter_id) are prohibited.",
        "disclaimer": ANALYTICS_DISCLAIMER
    }

@router.post("/research-dataset/generate")
async def generate_research_dataset(
    request: ResearcherCohortFilterRequest,
    current_user: User = Depends(require_roles(["Healthcare Researcher", "System Administrator"]))
):
    """
    Generate an anonymized cohort summary dataset based on approved research filter parameters.
    """
    df = load_analytics_dataframe()
    filtered = df.copy()

    if request.age_group:
        filtered = filtered[filtered['age'] == request.age_group]
    if request.gender:
        filtered = filtered[filtered['gender'] == request.gender]
    if request.race:
        filtered = filtered[filtered['race'] == request.race]
    if request.medical_specialty:
        filtered = filtered[filtered['medical_specialty'] == request.medical_specialty]
    if request.admission_type:
        filtered = filtered[filtered['admission_type_id'].astype(str) == request.admission_type]
    if request.diabetes_med:
        filtered = filtered[filtered['diabetesMed'] == request.diabetes_med]
    if request.change_status:
        filtered = filtered[filtered['change'] == request.change_status]
    if request.readmission_category:
        filtered = filtered[filtered['readmitted'] == request.readmission_category]
    if request.min_medications is not None:
        filtered = filtered[filtered['num_medications'] >= request.min_medications]
    if request.max_medications is not None:
        filtered = filtered[filtered['num_medications'] <= request.max_medications]

    cohort_name = "Filtered Research Cohort"
    metrics = calculate_cohort_metrics(filtered, len(df), cohort_name)

    # Safely extract anonymized sample data (top 5 rows) without direct identifiers and sanitize NaNs for JSON
    if len(filtered) > 0:
        safe_cols = [c for c in filtered.columns if c.lower() not in PROHIBITED_IDENTIFIER_COLUMNS]
        sample_df = filtered[safe_cols].head(5).replace({np.nan: None})
        sample_data = sample_df.to_dict(orient='records')
    else:
        sample_data = []

    return {
        "filter_applied": request.model_dump(),
        "record_count": len(filtered),
        "cohort_metrics": metrics,
        "sample_data": sample_data,
        "privacy_guarantee": "Filtered cohort contains ZERO patient_nbr or encounter_id direct identifiers.",
        "disclaimer": ANALYTICS_DISCLAIMER
    }

@router.post("/research-dataset/export")
async def export_research_dataset(
    request: ResearcherCohortFilterRequest,
    current_user: User = Depends(require_roles(["Healthcare Researcher", "System Administrator"]))
):
    """
    Server-side generation and export of an approved anonymized research dataset (CSV).
    Explicitly strips out patient_nbr, encounter_id, and direct PII.
    """
    df = load_analytics_dataframe()
    filtered = df.copy()

    if request.age_group:
        filtered = filtered[filtered['age'] == request.age_group]
    if request.gender:
        filtered = filtered[filtered['gender'] == request.gender]
    if request.race:
        filtered = filtered[filtered['race'] == request.race]
    if request.medical_specialty:
        filtered = filtered[filtered['medical_specialty'] == request.medical_specialty]
    if request.admission_type:
        filtered = filtered[filtered['admission_type_id'].astype(str) == request.admission_type]
    if request.diabetes_med:
        filtered = filtered[filtered['diabetesMed'] == request.diabetes_med]
    if request.change_status:
        filtered = filtered[filtered['change'] == request.change_status]
    if request.readmission_category:
        filtered = filtered[filtered['readmitted'] == request.readmission_category]
    if request.min_medications is not None:
        filtered = filtered[filtered['num_medications'] >= request.min_medications]
    if request.max_medications is not None:
        filtered = filtered[filtered['num_medications'] <= request.max_medications]

    # Explicitly filter out prohibited columns
    safe_cols = [c for c in filtered.columns if c.lower() not in PROHIBITED_IDENTIFIER_COLUMNS]
    export_df = filtered[safe_cols].copy()

    # Verify no prohibited columns exist
    for prohibited in PROHIBITED_IDENTIFIER_COLUMNS:
        if prohibited in export_df.columns:
            export_df.drop(columns=[prohibited], inplace=True)

    stream = io.StringIO()
    export_df.to_csv(stream, index=False)

    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=anonymized_research_dataset.csv"}
    )

@router.post("/analytical-report/export")
async def export_analytical_report(
    request: ReportExportRequest,
    current_user: User = Depends(require_roles(["Healthcare Researcher", "Hospital Administrator", "System Administrator"]))
):
    """
    Export aggregate analytical report data (CSV) for approved research and hospital management categories.
    """
    rtype = request.report_type.lower()
    
    stream = io.StringIO()
    writer = csv.writer(stream)

    if rtype == "treatment_effectiveness":
        res = TreatmentAnalyticsService.get_medication_outcomes()
        writer.writerow(["Cohort Name", "Sample Size (n)", "Cohort Percentage (%)", "Early Readmit Count (<30d)", "Early Readmit Rate (%)", "Relative Risk vs Baseline"])
        for c in res["cohort_outcomes"]:
            writer.writerow([c["cohort_name"], c["sample_size"], c["cohort_percentage"], c["early_readmit_count"], c["early_readmit_rate"], c["relative_risk_vs_baseline"]])

    elif rtype in ["readmission_trends", "readmission_statistics"]:
        res = HospitalPerformanceService.get_utilization_trends()
        writer.writerow(["Utilization Cohort", "Sample Size (n)", "Cohort Percentage (%)", "Early Readmit Count (<30d)", "Early Readmit Rate (%)", "Relative Risk vs Baseline"])
        for c in res["cohort_outcomes"]:
            writer.writerow([c["cohort_name"], c["sample_size"], c["cohort_percentage"], c["early_readmit_count"], c["early_readmit_rate"], c["relative_risk_vs_baseline"]])

    elif rtype == "population_health":
        res = HospitalPerformanceService.get_admission_context_outcomes()
        writer.writerow(["Population Health Dimension", "Sample Size (n)", "Cohort Percentage (%)", "Early Readmit Count (<30d)", "Early Readmit Rate (%)", "Relative Risk vs Baseline"])
        for c in res["cohort_outcomes"]:
            writer.writerow([c["cohort_name"], c["sample_size"], c["cohort_percentage"], c["early_readmit_count"], c["early_readmit_rate"], c["relative_risk_vs_baseline"]])

    elif rtype in ["department_performance", "medical_specialty"]:
        res = HospitalPerformanceService.get_admission_context_outcomes()
        writer.writerow(["Specialty / Context Cohort", "Sample Size (n)", "Cohort Percentage (%)", "Early Readmit Count (<30d)", "Early Readmit Rate (%)", "Relative Risk vs Baseline"])
        for c in res["cohort_outcomes"]:
            if "Specialty" in c["cohort_name"]:
                writer.writerow([c["cohort_name"], c["sample_size"], c["cohort_percentage"], c["early_readmit_count"], c["early_readmit_rate"], c["relative_risk_vs_baseline"]])

    elif rtype in ["patient_outcomes", "aggregated_analytics", "hospital_performance", "operational_analytics"]:
        res = HospitalPerformanceService.get_overall_performance()
        writer.writerow(["Metric Name", "Value", "Description"])
        writer.writerow(["Total Encounters Analyzed", res["total_encounters_analyzed"], "Total raw inpatient records"])
        writer.writerow(["Eligible Encounters Count", res["eligible_encounters_count"], "Non-expired clinical encounters"])
        writer.writerow(["30-Day Early Readmission Rate (%)", res["early_readmit_rate_pct"], "Primary system performance baseline"])
        writer.writerow(["Late Readmission Rate (>30d %)", res["late_readmit_rate_pct"], "Readmissions after 30 days"])
        writer.writerow(["No-Readmission Rate (%)", res["no_readmit_rate_pct"], "Encounters with no return visit"])
        writer.writerow(["Average Length of Stay (Days)", res["average_length_of_stay_days"], "Mean hospitalization duration"])
        writer.writerow(["High-Utilization Patient (%)", res["high_utilization_patient_pct"], "Prior inpatient or emergency visits > 0"])
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported report type '{request.report_type}'. Supported: treatment_effectiveness, readmission_trends, population_health, department_performance, patient_outcomes, operational_analytics, aggregated_analytics")

    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={rtype}_report.csv"}
    )
