from typing import List
from fastapi import APIRouter, Depends
from app.services.audit_service import AuditService
from app.dependencies import RoleChecker

router = APIRouter(prefix="/audit-logs", tags=["Audit Logging"])

sysadmin_dependency = Depends(RoleChecker(allowed_roles=["SysAdmin"]))

@router.get("", dependencies=[sysadmin_dependency])
def get_audit_logs(skip: int = 0, limit: int = 100):
    """
    Retrieves system audit logs (SysAdmin only).
    """
    return AuditService.get_logs(skip=skip, limit=limit)
