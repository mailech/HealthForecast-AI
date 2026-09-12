from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.auth import authenticate_user, create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ---------------------------------------------------------
# LOGIN REQUEST
# ---------------------------------------------------------

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)


# ---------------------------------------------------------
# LOGIN RESPONSE
# ---------------------------------------------------------

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    full_name: str
    role: str


# ---------------------------------------------------------
# LOGIN ENDPOINT
# ---------------------------------------------------------

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):

    user = authenticate_user(
        request.username,
        request.password
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = create_access_token(user)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["id"],
        "username": user["username"],
        "full_name": user["full_name"],
        "role": user["role"]
      }
