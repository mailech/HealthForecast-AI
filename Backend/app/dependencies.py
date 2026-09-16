from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.database import users_collection
from app.utils.security import decode_access_token

# Define OAuth2 login endpoint path
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

ROLE_MAP = {
    "hospital administrator": "admin",
    "healthcare researcher": "researcher",
    "system administrator": "sysadmin",
    "hospital admin": "admin",
    "system admin": "sysadmin",
    "admin": "admin",
    "doctor": "doctor",
    "researcher": "researcher",
    "sysadmin": "sysadmin"
}

def normalize_role(r: str) -> str:
    if not r:
        return ""
    clean = r.strip().lower()
    return ROLE_MAP.get(clean, clean.replace(" ", "_"))

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Decodes JWT token and returns the active user from the database.
    Token payload contains: sub (email), role, user_id.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if not email:
        raise credentials_exception
        
    user = users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
        
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact your System Administrator.",
        )
        
    return user

class RoleChecker:
    """
    Enforces role-based permissions (RBAC) on API routes.
    Supports Doctor, Researcher, Admin, SysAdmin and legacy strings.
    """
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles
        self.normalized_allowed = set()
        for role in allowed_roles:
            norm = normalize_role(role)
            self.normalized_allowed.add(norm)
            self.normalized_allowed.add(role.lower())
            self.normalized_allowed.add(role)

    def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role", "")
        norm_user_role = normalize_role(user_role)
        
        if (norm_user_role not in self.normalized_allowed and 
            user_role not in self.normalized_allowed and 
            user_role.lower() not in self.normalized_allowed):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation forbidden. Allowed roles: {self.allowed_roles}. Current role: '{user_role}'"
            )
        return current_user
