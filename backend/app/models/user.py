from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import enum

class UserRole(enum.Enum):
    """User roles enum"""
    DOCTOR = "doctor"
    HOSPITAL_ADMINISTRATOR = "hospital_administrator"
    HEALTHCARE_RESEARCHER = "healthcare_researcher"
    SYSTEM_ADMINISTRATOR = "system_administrator"

class PermissionType(enum.Enum):
    """Permission types enum"""
    # Patient Data
    VIEW_PATIENT_RECORDS = "view_patient_records"
    VIEW_MEDICAL_HISTORY = "view_medical_history"
    MODIFY_PATIENT_RECORDS = "modify_patient_records"
    
    # Risk & Prediction
    VIEW_RISK_PREDICTIONS = "view_risk_predictions"
    VIEW_READMISSION_FORECASTS = "view_readmission_forecasts"
    
    # Treatment
    VIEW_TREATMENT_EFFECTIVENESS = "view_treatment_effectiveness"
    
    # Analytics
    VIEW_HOSPITAL_ANALYTICS = "view_hospital_analytics"
    VIEW_POPULATION_HEALTH = "view_population_health"
    EXPORT_RESEARCH_DATASETS = "export_research_datasets"
    
    # Administration
    MANAGE_USERS = "manage_users"
    MANAGE_MODELS = "manage_models"
    CONFIGURE_PERMISSIONS = "configure_permissions"
    VIEW_AUDIT_LOGS = "view_audit_logs"

# Role-Permission Mapping
ROLE_PERMISSIONS = {
    UserRole.DOCTOR: [
        PermissionType.VIEW_PATIENT_RECORDS,
        PermissionType.VIEW_MEDICAL_HISTORY,
        PermissionType.VIEW_RISK_PREDICTIONS,
        PermissionType.VIEW_READMISSION_FORECASTS,
        PermissionType.VIEW_TREATMENT_EFFECTIVENESS,
    ],
    UserRole.HOSPITAL_ADMINISTRATOR: [
        PermissionType.VIEW_PATIENT_RECORDS,  # View only
        PermissionType.VIEW_MEDICAL_HISTORY,  # View only
        PermissionType.VIEW_RISK_PREDICTIONS,
        PermissionType.VIEW_READMISSION_FORECASTS,
        PermissionType.VIEW_TREATMENT_EFFECTIVENESS,
        PermissionType.VIEW_HOSPITAL_ANALYTICS,
        PermissionType.VIEW_POPULATION_HEALTH,
    ],
    UserRole.HEALTHCARE_RESEARCHER: [
        PermissionType.VIEW_RISK_PREDICTIONS,  # Aggregated only
        PermissionType.VIEW_READMISSION_FORECASTS,  # Aggregated only
        PermissionType.VIEW_TREATMENT_EFFECTIVENESS,
        PermissionType.VIEW_HOSPITAL_ANALYTICS,  # Aggregated only
        PermissionType.VIEW_POPULATION_HEALTH,
        PermissionType.EXPORT_RESEARCH_DATASETS,
    ],
    UserRole.SYSTEM_ADMINISTRATOR: [
        PermissionType.VIEW_PATIENT_RECORDS,
        PermissionType.VIEW_MEDICAL_HISTORY,
        PermissionType.VIEW_RISK_PREDICTIONS,
        PermissionType.VIEW_READMISSION_FORECASTS,
        PermissionType.VIEW_TREATMENT_EFFECTIVENESS,
        PermissionType.VIEW_HOSPITAL_ANALYTICS,
        PermissionType.VIEW_POPULATION_HEALTH,
        PermissionType.EXPORT_RESEARCH_DATASETS,
        PermissionType.MANAGE_USERS,
        PermissionType.MANAGE_MODELS,
        PermissionType.CONFIGURE_PERMISSIONS,
        PermissionType.VIEW_AUDIT_LOGS,
    ]
}

class User(db.Model):
    """User model for authentication and authorization"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.DOCTOR)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    assigned_patients = db.relationship('Patient', secondary='patient_assignments', backref='assigned_doctors')
    audit_logs = db.relationship('AuditLog', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def has_permission(self, permission):
        """Check if user has specific permission"""
        role_permissions = ROLE_PERMISSIONS.get(self.role, [])
        return permission in role_permissions
    
    def get_permissions(self):
        """Get all permissions for user's role"""
        return ROLE_PERMISSIONS.get(self.role, [])
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role.value,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'permissions': [p.value for p in self.get_permissions()]
        }
    
    def __repr__(self):
        return f'<User {self.username}>'

class Role(db.Model):
    """Role model for extensibility"""
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'permissions': [p.value for p in ROLE_PERMISSIONS.get(UserRole(self.name), [])]
        }

class Permission(db.Model):
    """Permission model for extensibility"""
    __tablename__ = 'permissions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category
        }

class AuditLog(db.Model):
    """Audit log for tracking user actions"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50))
    resource_id = db.Column(db.Integer)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    details = db.Column(db.JSON)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat(),
            'details': self.details
        }
