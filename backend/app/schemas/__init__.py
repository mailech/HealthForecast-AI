from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.schemas.role import RoleCreate, RoleResponse
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.schemas.medical_history import MedicalHistoryCreate, MedicalHistoryUpdate, MedicalHistoryResponse
from app.schemas.admission import AdmissionCreate, AdmissionUpdate, AdmissionResponse
from app.schemas.treatment import TreatmentCreate, TreatmentUpdate, TreatmentResponse
from app.schemas.audit_log import AuditLogResponse
from app.schemas.dashboard import DashboardStats

__all__ = [
    "UserCreate", "UserResponse", "UserLogin", "Token",
    "RoleCreate", "RoleResponse",
    "PatientCreate", "PatientUpdate", "PatientResponse",
    "MedicalHistoryCreate", "MedicalHistoryUpdate", "MedicalHistoryResponse",
    "AdmissionCreate", "AdmissionUpdate", "AdmissionResponse",
    "TreatmentCreate", "TreatmentUpdate", "TreatmentResponse",
    "AuditLogResponse", "DashboardStats"
]
