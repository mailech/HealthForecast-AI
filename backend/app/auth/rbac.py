from fastapi import Depends, HTTPException, status
from app.auth.auth import get_current_user
from app.models.models import UserDB

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: UserDB = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return role_checker

require_doctor = require_role(["Doctor"])
require_sysadmin = require_role(["System Administrator"])
require_hospital_admin = require_role(["Hospital Administrator"])
require_researcher = require_role(["Healthcare Researcher"])
