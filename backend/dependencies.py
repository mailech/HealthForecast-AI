from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models
import auth

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ==========================================================
# CORE: Extract current user from JWT
# ==========================================================
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = auth.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Contact your system administrator."
        )
    return user

# ==========================================================
# ROLE GUARDS
# ==========================================================
def require_doctor(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "Doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Doctor role required for this action."
        )
    return current_user

def require_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "Hospital Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Hospital Administrator role required for this action."
        )
    return current_user

def require_researcher(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "Healthcare Researcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Healthcare Researcher role required for this action."
        )
    return current_user

def require_sysadmin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "System Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: System Administrator role required for this action."
        )
    return current_user

def require_authorized_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Allow Doctor and Hospital Administrator (clinical roles) to access patient/prediction features."""
    if current_user.role not in ["Doctor", "Hospital Administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Authorized clinical role required."
        )
    return current_user

def require_any_authenticated(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Any authenticated user with a valid role can access."""
    valid_roles = ["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]
    if current_user.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Valid role required."
        )
    return current_user

def require_admin_or_sysadmin(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Hospital Admin or System Admin can access user management and analytics."""
    if current_user.role not in ["Hospital Administrator", "System Administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Administrator role required."
        )
    return current_user
