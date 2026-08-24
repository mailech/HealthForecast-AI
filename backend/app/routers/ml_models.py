from fastapi import APIRouter, Depends

from app.schemas.model_management import ModelRegistryResponse
from app.core.rbac import RoleChecker
from app.models.user import UserRole


router = APIRouter(
    prefix="/ml-models",
    tags=["ML Model Registry"]
)


@router.get(
    "/",
    response_model=list[ModelRegistryResponse],
    dependencies=[
        Depends(
            RoleChecker([
                UserRole.HOSPITAL_ADMIN,
                UserRole.SYSTEM_ADMIN
            ])
        )
    ]
)
async def list_models():
    """Placeholder for listing deployed ML models."""

    return [
        ModelRegistryResponse(
            id=1,
            model_name="XGBoost_Readmit",
            version="v1.0.0",
            accuracy=0.89,
            is_active=True
        )
    ]