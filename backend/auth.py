"""
HealthForecast AI - Authentication & Role-Based Access Control (RBAC)
Supports JWT token issuance, verification, and role security guards.
"""

from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, Security, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db_connection, hash_password

SECRET_KEY = "healthforecast-ai-quantum-medical-encryption-key-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

security = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(email: str, password_plain: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed = hash_password(password_plain)
    cursor.execute("SELECT * FROM users WHERE email = ? AND password_hash = ?", (email, hashed))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return None
    return dict(user)

def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Security(security)):
    # 1. First check if a valid JWT token was provided
    if credentials:
        token = credentials.credentials
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
                user = cursor.fetchone()
                conn.close()
                if user:
                    return dict(user)
        except Exception:
            pass

    # 2. Check for X-User-Role header or query parameter for demo role switching
    role_header = request.headers.get("x-role") or request.query_params.get("role")
    conn = get_db_connection()
    cursor = conn.cursor()

    if role_header:
        cursor.execute("SELECT * FROM users WHERE role = ? LIMIT 1", (role_header,))
        user = cursor.fetchone()
        if user:
            conn.close()
            return dict(user)

    # 3. Default fallback to doctor account for demonstration
    cursor.execute("SELECT * FROM users WHERE email = 'doctor@healthforecast.ai'")
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)

    raise HTTPException(status_code=401, detail="Authentication credentials required")

def require_role(allowed_roles: list):
    """
    Decorator dependency for enforcing Role-Based Access Control (RBAC).
    Allowed roles: 'doctor', 'hospital_admin', 'healthcare_researcher', 'system_admin'
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        # System Admin has universal superuser access
        if user_role == "system_admin":
            return current_user
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Your role '{user_role}' lacks permission for this endpoint. Required: {allowed_roles}"
            )
        return current_user
    return role_checker
