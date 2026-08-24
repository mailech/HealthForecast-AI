from pydantic import BaseModel, ConfigDict


class RecommendationBase(BaseModel):
    prediction_id: int
    actionable_insight: str
    priority: str = "MEDIUM"


class RecommendationResponse(RecommendationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)