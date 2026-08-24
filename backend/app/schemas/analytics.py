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