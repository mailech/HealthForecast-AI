from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_role
from app.services.data_integration import DiabetesDatasetIntegration
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/integrate")
def integrate_dataset(
    dataset_path: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("System Administrator"))
):
    """
    Integrate Diabetes 130-US Hospitals Dataset
    Only accessible by System Administrator
    """
    try:
        integrator = DiabetesDatasetIntegration(dataset_path)
        success = integrator.run_integration()
        
        if success:
            return {"message": "Dataset integration completed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Dataset integration failed"
            )
    except Exception as e:
        logger.error(f"Dataset integration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
