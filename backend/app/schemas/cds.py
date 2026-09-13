from pydantic import BaseModel
from typing import List, Optional

class CDSRecommendation(BaseModel):
    id: str
    category: str
    severity: str  # 'critical' | 'warning' | 'info' | 'success'
    title: str
    recommendation: str
    rationale: str
    evidence_source: str
    action_type: str
    suggested_action: str

class CDSSummary(BaseModel):
    patient_id: int
    encounter_id: Optional[int] = None
    patient_name: str
    overall_risk_level: str
    risk_score: float
    critical_alerts_count: int
    warning_alerts_count: int
    total_recommendations: int
    recommendations: List[CDSRecommendation]
    generated_at: str
