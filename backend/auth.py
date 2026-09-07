from fastapi import APIRouter,HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/API/v1/auth",tags=["Authentication"])

USERS_DB= {
    "doctor@hospital.com" : {
        "username" : "doctor@hospital.com",
        "password" : "doctor123",
        "name" : "Dr. Tom",
        "role" : "Doctor"
    },
    "admin@hospital.com" : {
        "username" : "admin@hospital.com",
        "password" : "doctor123",
        "name" : "Dr. Hulk",
        "role" : "Hospital Admininstrator"
    },
    "researcher@hospital.com" : {
        "username" : "researcher@hospital.com",
        "password" : "doctor123",
        "name" : "Dr. Banner",
        "role" : "Healthcare Researcher"
    },
    "sysadmin@hospital.com" : {
        "username" : "sysadmin@hospital.com",
        "password" : "doctor123",
        "name" : "Dr. Strange",
        "role" : "System Administrator"
    },
}

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(request: LoginRequest):
    user = USERS_DB.get(request.username)
    if not user or user["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    return {
        "status" : "Success",
        "message" : "Login successful",
        "user" : {
            "name" : user["name"],
            "role" : user["role"],
            "email" : user["username"]
        },
        "token" : "mock-jwt-token-12345"
    }