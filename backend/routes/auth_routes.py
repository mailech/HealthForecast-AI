from fastapi import APIRouter, Depends, HTTPException

import bcrypt
import jwt

from datetime import datetime, timedelta, timezone

from auth import get_current_user
from shared import (
    RegisterUser,
    LoginUser,
    users_collection,
    SYSTEM_ADMIN_EMAIL,
    SYSTEM_ADMIN_PASSWORD,
    JWT_SECRET,
    JWT_ALGORITHM,
    is_system_admin_email,
)


router = APIRouter()


# =========================================================
# CURRENT USER
# =========================================================


@router.get("/api/me")
def get_me(
    current_user: dict = Depends(get_current_user),
):
    return current_user


# =========================================================
# REGISTER
# =========================================================


@router.post("/api/register")
def register_user(
    user: RegisterUser,
):

    allowed_registration_roles = {
        "Doctor",
        "Hospital Administrator",
        "Healthcare Researcher",
    }

    if user.role not in allowed_registration_roles:

        raise HTTPException(
            status_code=403,
            detail=(
                "System Administrator accounts cannot be "
                "created through public registration."
            ),
        )

    if is_system_admin_email(str(user.email)):

        raise HTTPException(
            status_code=403,
            detail=(
                "This email is reserved for the "
                "System Administrator."
            ),
        )

    existing_user = users_collection.find_one(
        {
            "email": str(user.email).lower()
        }
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt(),
    )

    user_data = {
        "name": user.name,
        "email": str(user.email).lower(),
        "password": hashed_password.decode("utf-8"),
        "role": user.role,
        "created_at": datetime.now(timezone.utc),
    }

    result = users_collection.insert_one(
        user_data
    )

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
    }


# =========================================================
# LOGIN
# =========================================================


@router.post("/api/login")
def login_user(
    user: LoginUser,
):

    email = str(user.email).lower()

    # -----------------------------------------------------
    # SYSTEM ADMIN
    # -----------------------------------------------------

    if email == SYSTEM_ADMIN_EMAIL.lower():

        if user.password != SYSTEM_ADMIN_PASSWORD:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password.",
            )

        token = jwt.encode(
            {
                "user_id": "system-admin",
                "email": SYSTEM_ADMIN_EMAIL,
                "role": "System Administrator",
                "exp": (
                    datetime.now(timezone.utc)
                    + timedelta(hours=2)
                ),
            },
            JWT_SECRET,
            algorithm=JWT_ALGORITHM,
        )

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": "system-admin",
                "name": "System Administrator",
                "email": SYSTEM_ADMIN_EMAIL,
                "role": "System Administrator",
            },
        }

    # -----------------------------------------------------
    # NORMAL USER
    # -----------------------------------------------------

    existing_user = users_collection.find_one(
        {
            "email": email
        }
    )

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    try:

        password_correct = bcrypt.checkpw(
            user.password.encode("utf-8"),
            existing_user["password"].encode("utf-8"),
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not password_correct:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    token = jwt.encode(
        {
            "user_id": str(existing_user["_id"]),
            "email": existing_user["email"],
            "role": existing_user["role"],
            "exp": (
                datetime.now(timezone.utc)
                + timedelta(hours=2)
            ),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user["name"],
            "email": existing_user["email"],
            "role": existing_user["role"],
        },
    }