import os
from datetime import datetime, timedelta, timezone
from typing import Dict

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.auth_database import (
    get_user_by_username,
    get_user_by_id,
    verify_password,
)


# ---------------------------------------------------------
# JWT CONFIGURATION
# ---------------------------------------------------------

SECRET_KEY = os.getenv(
    "HEALTHFORECAST_SECRET_KEY",
    "healthforecast-demo-secret-change-before-deployment"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


security = HTTPBearer()


# ---------------------------------------------------------
# CREATE JWT TOKEN
# ---------------------------------------------------------

def create_access_token(user: Dict) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "role": user["role"],
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ---------------------------------------------------------
# VERIFY JWT TOKEN
# ---------------------------------------------------------

def verify_token(token: str) -> Dict:

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

        user = get_user_by_id(int(user_id))

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        return user

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


# ---------------------------------------------------------
# GET CURRENT LOGGED-IN USER
# ---------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:

    token = credentials.credentials

    return verify_token(token)


# ---------------------------------------------------------
# LOGIN USER
# ---------------------------------------------------------

def authenticate_user(
    username: str,
    password: str
):

    user = get_user_by_username(username)

    if not user:
        return None

    if not user["is_active"]:
        return None

    if not verify_password(
        password,
        user["password_hash"]
    ):
        return None

    return user
