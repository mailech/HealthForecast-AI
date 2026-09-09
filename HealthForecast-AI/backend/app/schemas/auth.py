from pydantic import BaseModel, Field, field_validator
import re


EMAIL_PATTERN = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)


def validate_email(value: str) -> str:
    value = value.strip().lower()

    if not EMAIL_PATTERN.match(value):
        raise ValueError("Please enter a valid email address")

    return value


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_login_email(cls, value: str) -> str:
        return validate_email(value)


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    hospital: str = Field(
        default="Demo Hospital",
        min_length=2,
        max_length=120
    )

    @field_validator("email")
    @classmethod
    def validate_register_email(cls, value: str) -> str:
        return validate_email(value)


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    hospital: str

    model_config = {
        "from_attributes": True
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut