from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.security import decode_token
from app.database import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_roles(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


def can_access_patient(user: User, patient) -> bool:
    if user.role == UserRole.SYSTEM_ADMIN:
        return True
    if user.role == UserRole.HOSPITAL_ADMIN:
        return True
    if user.role == UserRole.RESEARCHER:
        return True
    if user.role == UserRole.DOCTOR:
        return patient.assigned_doctor_id == user.id
    return False


def can_modify_patient(user: User) -> bool:
    return user.role in [UserRole.SYSTEM_ADMIN, UserRole.DOCTOR]


def can_view_pii(user: User) -> bool:
    return user.role != UserRole.RESEARCHER
