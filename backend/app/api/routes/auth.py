from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.rbac import Role
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.patient import Patient
from app.models.user import User
from app.schemas.user import LoginRequest, PatientLoginRequest, PatientSignupRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(subject=str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )


@router.post("/patient/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def patient_signup(payload: PatientSignupRequest, db: Session = Depends(get_db)):
    """Self-service patient portal signup: mobile number + password only.

    A hospital staff member must have already recorded this phone number on
    a Patient record (at intake/registration) — signup only ever *claims*
    an existing record, it never creates one. This is the security boundary:
    without a phone number match, there's no way to attach a login to
    someone else's medical data.
    """
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    patient = db.query(Patient).filter(Patient.phone_number == payload.phone_number).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No patient record found with this mobile number. Please check with hospital staff.",
        )

    if db.query(User).filter(User.patient_id == patient.id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account already exists for this mobile number. Please sign in instead.",
        )

    user = User(
        email=f"patient-{patient.id}@patients.healthforecast.ai",  # placeholder — patients sign in by phone, not email
        hashed_password=hash_password(payload.password),
        full_name=patient.full_name,
        role=Role.PATIENT.value,
        patient_id=patient.id,
        phone_number=payload.phone_number,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(subject=str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@router.post("/patient/login", response_model=TokenResponse)
def patient_login(payload: PatientLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == payload.phone_number, User.role == Role.PATIENT.value).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid mobile number or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(subject=str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
