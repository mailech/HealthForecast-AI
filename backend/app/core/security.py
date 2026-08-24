from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
import bcrypt
from app.core.config import settings

# PBKDF2 avoids the Passlib/bcrypt backend incompatibility while keeping
# bcrypt available for users created before this change.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """Hash new passwords with the configured PBKDF2 scheme."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify PBKDF2 hashes with Passlib and legacy bcrypt hashes directly."""
    if not isinstance(plain_password, str) or not isinstance(hashed_password, str) or not hashed_password:
        return False

    try:
        if hashed_password.startswith(("$2a$", "$2b$", "$2y$")):
            return bcrypt.checkpw(
                plain_password.encode("utf-8"),
                hashed_password.encode("ascii"),
            )

        if hashed_password.startswith(("$pbkdf2-", "$pbkdf2_")):
            return pwd_context.verify(plain_password, hashed_password)
    except (ValueError, TypeError, UnicodeError):
        return False

    return False


def create_access_token(subject: Any, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT Access Token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(subject),
        "role": str(role),
        "exp": expire
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decodes JWT Token and returns payload if valid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None