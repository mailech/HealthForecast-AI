"""
Role-Based Access Control.

Every protected route declares which roles may call it via `require_roles(...)`.
This keeps authorization rules visible at the route definition instead of
scattered through business logic, and matches the Access Matrix in the
project spec exactly (Doctor / Hospital Administrator / Healthcare Researcher
/ System Administrator).
"""
from enum import Enum

from fastapi import Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import User


class Role(str, Enum):
    DOCTOR = "doctor"
    HOSPITAL_ADMIN = "hospital_admin"
    RESEARCHER = "researcher"
    SYSTEM_ADMIN = "system_admin"
    PATIENT = "patient"


def require_roles(*allowed_roles: Role):
    """Dependency factory: restricts a route to the given roles.

    Usage:
        @router.get("/admin-only")
        def route(user: User = Depends(require_roles(Role.SYSTEM_ADMIN))):
            ...
    """

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in {r.value for r in allowed_roles}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not permitted to access this resource.",
            )
        return current_user

    return dependency
