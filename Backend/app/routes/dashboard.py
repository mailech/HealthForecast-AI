from fastapi import APIRouter, Depends, HTTPException, status
from app.services.dashboard_service import DashboardService
from app.dependencies import RoleChecker, get_current_user
import logging

logger = logging.getLogger("app.routes.dashboard")

router = APIRouter(prefix="/dashboard", tags=["Dashboard Intelligence"])

# Define access dependency for all authenticated users
dashboard_dependency = Depends(RoleChecker(allowed_roles=[
    "Doctor", "Researcher", "Admin", "SysAdmin",
    "Hospital Administrator", "Healthcare Researcher", "System Administrator"
]))

@router.get("/stats", dependencies=[dashboard_dependency])
def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """
    Fetches real-time dashboard aggregates, including total patients, high risk count,
    risk level breakdown, and historical daily admission trends.
    """
    logger.info(f"DASHBOARD ENDPOINT CALLED BY USER: {current_user.get('email')} ({current_user.get('role')})")
    print(f"DASHBOARD ENDPOINT CALLED BY USER: {current_user.get('email')} ({current_user.get('role')})")
    try:
        stats = DashboardService.get_stats()
        logger.info(
            f"DASHBOARD STATS FETCHED SUCCESSFULLY: "
            f"total_patients={stats.get('total_patients')}, "
            f"total_predictions={stats.get('total_predictions')}, "
            f"high_risk_count={stats.get('high_risk_count')}"
        )
        print(
            f"DASHBOARD STATS FETCHED SUCCESSFULLY: "
            f"total_patients={stats.get('total_patients')}, "
            f"total_predictions={stats.get('total_predictions')}, "
            f"high_risk_count={stats.get('high_risk_count')}"
        )
        return stats
    except Exception as e:
        logger.error(f"DASHBOARD STATS ERROR EXCEPTION: {e}", exc_info=True)
        print(f"DASHBOARD STATS ERROR EXCEPTION: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard statistics: {e}"
        )
