from fastapi import Depends,HTTPException,status
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.db.session import get_db
from app.models import User
bearer=HTTPBearer()
def get_current_user(credentials:HTTPAuthorizationCredentials=Depends(bearer),db:Session=Depends(get_db)):
    try: uid=int(decode_token(credentials.credentials)["sub"])
    except (ValueError,KeyError,TypeError): raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid token")
    user=db.get(User,uid)
    if not user or not user.is_active: raise HTTPException(status_code=401,detail="User not found")
    return user
def require_roles(*roles):
    def checker(user=Depends(get_current_user)):
        if user.role not in roles: raise HTTPException(403,"Insufficient permissions")
        return user
    return checker
