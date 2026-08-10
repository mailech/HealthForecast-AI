import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.rbac import Role, require_roles
from app.core.security import hash_password
from app.models.patient import Patient
from app.models.user import User
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/users", tags=["users"])

# Per the Access Matrix: only System Administrator manages users/roles.
_admin_only = require_roles(Role.SYSTEM_ADMIN)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db), _=Depends(_admin_only)):
    if payload.role not in {r.value for r in Role}:
        raise HTTPException(status_code=422, detail=f"Invalid role '{payload.role}'")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="A user with this email already exists")

    if payload.role == Role.PATIENT.value:
        if not payload.patient_id:
            raise HTTPException(status_code=422, detail="patient_id is required for role='patient'")
        if not db.get(Patient, payload.patient_id):
            raise HTTPException(status_code=404, detail="No patient record found with that patient_id")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        hospital_id=payload.hospital_id,
        patient_id=payload.patient_id if payload.role == Role.PATIENT.value else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(_admin_only)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(user_id: uuid.UUID, db: Session = Depends(get_db), _=Depends(_admin_only)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user
