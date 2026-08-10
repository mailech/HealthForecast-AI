from pydantic import BaseModel, field_validator


class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v):
        if "@" not in v:
            raise ValueError("Email must contain '@'")
        return v


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v):
        if "@" not in v:
            raise ValueError("Email must contain '@'")
        return v


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True