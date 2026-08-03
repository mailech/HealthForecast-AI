from fastapi import APIRouter, Depends, Response
from app.services.report_service import ReportService
from app.dependencies import RoleChecker

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

reports_dependency = Depends(RoleChecker(allowed_roles=[
    "Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"
]))

@router.get("/generate", dependencies=[reports_dependency])
def generate_report():
    """
    Generates a structured medical analytics and clinical readmission risk report.
    """
    return ReportService.generate_summary_report()

@router.get("/export-csv", dependencies=[reports_dependency])
def export_csv():
    """
    Exports the readmission predictions and demographic logs as a downloadable CSV.
    """
    csv_data = ReportService.export_predictions_csv()
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=readmission_risk_report.csv"
        }
    )
