from pydantic import BaseModel, Field


# -------------------------
# USER SCHEMAS
# -------------------------

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str
    password: str


# -------------------------
# HEALTH PROFILE SCHEMAS
# -------------------------

class HealthProfileCreate(BaseModel):
    age: int
    gender: str
    height: float
    weight: float
    blood_pressure: str
    blood_sugar: float
    smoking: str
    alcohol: str
    physical_activity: str


class HealthProfileResponse(BaseModel):
    id: int
    user_id: int
    age: int
    gender: str
    height: float
    weight: float
    blood_pressure: str
    blood_sugar: float
    smoking: str
    alcohol: str
    physical_activity: str

    class Config:
        from_attributes = True


# -------------------------
# HEART DISEASE PREDICTION
# -------------------------

from pydantic import BaseModel, Field


class HeartDiseasePredictRequest(BaseModel):
    age: float = Field(ge=1, le=120)
    sex: float = Field(ge=0, le=1)
    cp: float = Field(ge=0, le=3)
    trestbps: float = Field(ge=50, le=250)
    chol: float = Field(ge=50, le=700)
    fbs: float = Field(ge=0, le=1)
    restecg: float = Field(ge=0, le=2)
    thalach: float = Field(ge=50, le=250)
    exang: float = Field(ge=0, le=1)
    oldpeak: float = Field(ge=0, le=10)
    slope: float = Field(ge=0, le=2)
    ca: float = Field(ge=0, le=3)
    thal: float = Field(ge=0, le=3)