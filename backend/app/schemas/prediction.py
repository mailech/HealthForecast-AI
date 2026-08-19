from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class RiskPredictionRequest(BaseModel):
    patient_id: int
    model_type: Optional[str] = "random_forest"


class RiskPredictionResponse(BaseModel):
    id: int
    patient_id: int
    risk_score: float
    risk_category: str
    readmission_probability: float
    model_used: str
    feature_importance: Optional[dict] = None
    clinical_insights: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReadmissionForecastRequest(BaseModel):
    patient_id: int
    forecast_period_days: int = 30


class ReadmissionForecastResponse(BaseModel):
    id: int
    patient_id: int
    forecast_period_days: int
    readmission_probability: float
    confidence_score: float
    risk_factors: List[str]
    recommendations: List[str]
    forecast_report: str
    created_at: datetime

    class Config:
        from_attributes = True


class ClinicalInsightResponse(BaseModel):
    patient_id: int
    patient_code: str
    risk_category: str
    risk_score: float
    readmission_probability: float
    key_risk_factors: List[str]
    care_recommendations: List[str]
    follow_up_plan: List[str]
    discharge_support: List[str]


class ModelMetricsResponse(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    trained_at: Optional[str] = None


class DashboardStatsResponse(BaseModel):
    total_patients: int
    high_risk_patients: int
    medium_risk_patients: int
    low_risk_patients: int
    avg_readmission_probability: float
    readmission_rate: float
    recent_predictions: int
    model_accuracy: float
