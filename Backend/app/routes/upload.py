from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from app.services.upload_service import UploadService
from app.dependencies import RoleChecker

router = APIRouter(prefix="/upload", tags=["Dataset Import"])

upload_dependency = Depends(RoleChecker(allowed_roles=[
    "Hospital Administrator", "Healthcare Researcher", "System Administrator"
]))

@router.post("", dependencies=[upload_dependency])
async def upload_dataset(file: UploadFile = File(...)):
    """
    Accepts, decodes, and processes a CSV dataset containing patient clinical history logs.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files (.csv) are supported."
        )
        
    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read file content: {str(e)}"
        )
        
    success, errors, count = UploadService.validate_and_import_csv(content_str)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "CSV validation failed. Import process aborted.",
                "errors": errors
            }
        )
        
    return {
        "status": "success",
        "message": f"Successfully validated and imported {count} medical history records.",
        "records_imported": count
    }
