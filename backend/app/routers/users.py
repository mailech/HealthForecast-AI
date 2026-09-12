from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud
from ..auth import (
    create_access_token,
    get_current_user,
    verify_password,
    hash_password,
    require_roles,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=schemas.UserResponse
)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    # Check whether email already exists
    existing = crud.get_user_by_email(
        db,
        user.email
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Public registration ALWAYS creates a Patient
    return crud.create_user(
        db,
        user
    )


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):

    db_user = crud.get_user_by_email(
        db,
        user.email
    )

    # Invalid credentials
    if not db_user or not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Upgrade old plaintext password to bcrypt
    if not db_user.password.startswith("$2"):

        db_user.password = hash_password(
            user.password
        )

        db.commit()
        db.refresh(db_user)

    # Create JWT token
    token = create_access_token(
        db_user
    )

    return {
        "message": "Login Successful",

        "access_token": token,

        "token_type": "bearer",

        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=schemas.UserResponse
)
def get_me(
    current_user=Depends(get_current_user)
):

    return current_user


# ============================================================
# ADMIN — VIEW ALL USERS
# ============================================================

@router.get(
    "/",
    response_model=list[schemas.UserResponse]
)
def get_all_users(
    current_user=Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):

    return crud.get_users(db)


# ============================================================
# ADMIN — CREATE DOCTOR / STAFF
# ============================================================

@router.post(
    "/admin/create",
    response_model=schemas.UserResponse
)
def create_staff_or_doctor(
    user: schemas.AdminUserCreate,
    current_user=Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):

    # Only Doctor and Staff can be created here
    if user.role not in ["doctor", "staff"]:
        raise HTTPException(
            status_code=400,
            detail="Admin can only create Doctor or Staff accounts"
        )

    # Check duplicate email
    existing = crud.get_user_by_email(
        db,
        user.email
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return crud.create_staff_or_doctor(
        db,
        user
    ) 