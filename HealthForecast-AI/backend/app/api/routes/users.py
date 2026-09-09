from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.core.security import hash_password
from app.db.session import get_db
from app.models import AuditLog, User
from app.schemas.auth import UserOut

router = APIRouter(prefix="/users", tags=["User Management"])

ALLOWED_ROLES = {
    "doctor",
    "hospital_administrator",
    "healthcare_researcher",
    "system_administrator",
}


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str
    hospital: str = Field(default="Demo Hospital", min_length=2, max_length=120)


@router.get("", response_model=list[UserOut])
def list_users(
    user=Depends(require_roles("system_administrator")),
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(User.id.desc()).all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    user=Depends(require_roles("system_administrator")),
    db: Session = Depends(get_db),
):
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    email = payload.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        full_name=payload.full_name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        hospital=payload.hospital.strip(),
        is_active=True,
    )
    db.add(new_user)
    db.flush()
    db.add(
        AuditLog(
            user_id=user.id,
            action="CREATE_USER",
            details=f"Created {payload.role} account for {email}",
        )
    )
    db.commit()
    db.refresh(new_user)
    return new_user
