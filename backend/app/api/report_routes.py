from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.auth.auth import get_current_user
from app.models.models import UserDB
from app.services.audit_service import log_action

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.get("")
def get_reports_list(db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    log_action(db, current_user, "VIEW_REPORTS", "Reports List")
    return [
        {
            "id": 1,
            "title": "Monthly Hospital Readmission Audit - July 2026",
            "report_type": "Monthly Audit",
            "department": "All Departments",
            "generated_by": "Dr. Sarah Jenkins",
            "file_format": "PDF",
            "date": "2026-07-31",
            "size": "2.4 MB"
        },
        {
            "id": 2,
            "title": "Cardiology High-Risk Cohort Analysis",
            "report_type": "High Risk Summary",
            "department": "Cardiology",
            "generated_by": "System AI Audit",
            "file_format": "CSV",
            "date": "2026-08-01",
            "size": "840 KB"
        },
        {
            "id": 3,
            "title": "Q2 Polypharmacy & Medication Adherence Intelligence",
            "report_type": "Treatment Analysis",
            "department": "Internal Medicine",
            "generated_by": "Dr. Robert Vance",
            "file_format": "PDF",
            "date": "2026-07-15",
            "size": "4.1 MB"
        }
    ]

@router.post("/generate")
def generate_report(title: str, report_type: str, department: str = "All Departments", db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    log_action(db, current_user, "GENERATE_REPORT", title)
    return {
        "status": "success",
        "message": f"Report '{title}' generated successfully.",
        "download_url": f"/api/v1/reports/download/mock_report.pdf",
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }
