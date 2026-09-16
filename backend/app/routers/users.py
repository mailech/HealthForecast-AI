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

    # Public registration is no longer used.
    # User accounts should be created by an Admin.

    raise HTTPException(
        status_code=403,
        detail="Public registration is disabled. Please contact an administrator."
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

    # Check email and password
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
# ADMIN — CREATE DOCTOR / STAFF / RESEARCHER
# ============================================================

@router.post(
    "/admin/create",
    response_model=schemas.UserResponse
)
def create_managed_user(
    user: schemas.AdminUserCreate,
    current_user=Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):

    # Admin can create these three types of accounts
    allowed_roles = [
        "doctor",
        "staff",
        "researcher"
    ]

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Admin can only create Doctor, Staff or Researcher accounts"
        )

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

    return crud.create_managed_user(
        db,
        user
    )
