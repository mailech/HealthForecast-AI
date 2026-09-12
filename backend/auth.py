import os
from typing import Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database.connection import users_collection
from dotenv import load_dotenv


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# ROLES
# =========================================================

ROLES = {
    "Doctor",
    "Hospital Administrator",
    "Healthcare Researcher",
    "System Administrator",
}


# =========================================================
# JWT CONFIGURATION
# =========================================================

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is missing. Add JWT_SECRET to your .env file."
    )

JWT_ALGORITHM = "HS256"


# =========================================================
# SYSTEM ADMIN CONFIGURATION
# =========================================================

SYSTEM_ADMIN_EMAIL = os.getenv("SYSTEM_ADMIN_EMAIL")

SYSTEM_ADMIN_PASSWORD = os.getenv("SYSTEM_ADMIN_PASSWORD")

if not SYSTEM_ADMIN_EMAIL or not SYSTEM_ADMIN_PASSWORD:
    raise RuntimeError(
        "SYSTEM_ADMIN_EMAIL and SYSTEM_ADMIN_PASSWORD "
        "must be defined in your .env file."
    )


# =========================================================
# HTTP BEARER AUTHENTICATION
# =========================================================

security = HTTPBearer()


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):

    token = credentials.credentials

    # -----------------------------------------------------
    # VERIFY JWT
    # -----------------------------------------------------

    try:

        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    # -----------------------------------------------------
    # GET USER ID
    # -----------------------------------------------------

    user_id = payload.get("user_id")

    if not user_id:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    # =====================================================
    # SYSTEM ADMINISTRATOR
    # =====================================================

    if user_id == "system-admin":

        email = payload.get("email")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid administrator token.",
            )

        if email.lower() != SYSTEM_ADMIN_EMAIL.lower():

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid administrator account.",
            )

        return {
            "id": "system-admin",
            "name": "System Administrator",
            "email": SYSTEM_ADMIN_EMAIL,
            "role": "System Administrator",
        }

    # =====================================================
    # NORMAL USERS
    # =====================================================

    from bson import ObjectId

    try:

        object_id = ObjectId(user_id)

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID.",
        )

    user = users_collection.find_one(
        {
            "_id": object_id
        }
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
        )

    role = user.get("role")

    if role not in ROLES:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid user role.",
        )

    # -----------------------------------------------------
    # IMPORTANT:
    # The configured System Admin email cannot exist as a
    # normal MongoDB user.
    # -----------------------------------------------------

    if user.get("email", "").lower() == SYSTEM_ADMIN_EMAIL.lower():

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "This email is reserved for the "
                "System Administrator."
            ),
        )

    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": role,
    }


# =========================================================
# ROLE AUTHORIZATION
# =========================================================

def require_roles(*allowed_roles: str) -> Callable:

    def role_checker(
        current_user: dict = Depends(get_current_user),
    ):

        if current_user["role"] not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission to access "
                    "this resource."
                ),
            )

        return current_user

    return role_checker


# =========================================================
# DOCTOR / SYSTEM ADMIN PATIENT ACCESS
# =========================================================

def doctor_or_admin_for_patient(
    current_user: dict = Depends(get_current_user),
):

    if current_user["role"] not in {
        "Doctor",
        "System Administrator",
    }:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have permission to access patients."
            ),
        )

    return current_user