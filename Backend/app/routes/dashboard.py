from fastapi import APIRouter, Depends
from app.services.dashboard_service import DashboardService
from app.dependencies import RoleChecker

router = APIRouter(prefix="/dashboard", tags=["Dashboard Intelligence"])

# Define access dependency for all authenticated users
dashboard_dependency = Depends(RoleChecker(allowed_roles=[
    "Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"
]))

@router.get("/stats", dependencies=[dashboard_dependency])
def get_dashboard_stats():
    """
    Fetches real-time dashboard aggregates, including total patients, high risk count,
    risk level breakdown, and historical daily admission trends.
    """
    return DashboardService.get_stats()
