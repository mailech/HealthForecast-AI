from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User, UserRole
from ..schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
)
from ..utils.security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_role,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Public registration creates Doctor accounts only.

    Elevated roles must be created through controlled
    administrative setup rather than self-registration.
    """

    existing_user = (
        db.query(User)
        .filter(User.email == register_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    user = User(
        name=register_data.name,
        email=register_data.email,
        hashed_password=hash_password(register_data.password),
        role=UserRole.DOCTOR,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Doctor account registered successfully",
        "user": user
    }


@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    if not verify_password(
        login_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role.value
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/protected")
def protected_route(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": "Authentication successful",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value
    }


@router.get("/doctor-only")
def doctor_only_route(
    current_user: User = Depends(require_role("doctor"))
):
    return {
        "message": "Doctor authorization successful",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value
    }


@router.get("/admin-only")
def admin_only_route(
    current_user: User = Depends(require_role("system_admin"))
):
    return {
        "message": "Admin authorization successful",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value
    }