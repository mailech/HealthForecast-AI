from fastapi import APIRouter, Depends
from app.schemas.treatment import TreatmentCreate, TreatmentResponse

router = APIRouter(prefix="/treatments", tags=["Treatments"])


@router.post("/", response_model=TreatmentResponse)
async def create_treatment(treatment_in: TreatmentCreate):
    """Placeholder for adding treatment logs."""
    return TreatmentResponse(id=1, **treatment_in.model_dump())