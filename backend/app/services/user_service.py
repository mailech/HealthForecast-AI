from app.models.user import User, Role, Permission, UserRole, AuditLog
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash
import re

class UserService:
    """Service for user management operations"""
    
    @staticmethod
    def create_user(data):
        """Create a new user"""
        # Validate email
        if not UserService._validate_email(data['email']):
            raise ValueError('Invalid email format')
        
        # Check if email or username already exists
        if User.query.filter_by(email=data['email']).first():
            raise ValueError('Email already registered')
        if User.query.filter_by(username=data['username']).first():
            raise ValueError('Username already taken')
        
        # Create user
        user = User(
            email=data['email'],
            username=data['username'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=UserRole(data.get('role', 'doctor'))
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return user
    
    @staticmethod
    def get_user(user_id):
        """Get user by ID"""
        return User.query.get(user_id)
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def get_user_by_username(username):
        """Get user by username"""
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def get_all_users(page=1, per_page=20, role=None):
        """Get all users with pagination"""
        query = User.query
        
        if role:
            query = query.filter_by(role=UserRole(role))
        
        return query.paginate(page=page, per_page=per_page, error_out=False)
    
    @staticmethod
    def update_user(user_id, data):
        """Update user information"""
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        
        # Update fields
        if 'email' in data:
            if not UserService._validate_email(data['email']):
                raise ValueError('Invalid email format')
            if User.query.filter(User.email == data['email'], User.id != user_id).first():
                raise ValueError('Email already registered')
            user.email = data['email']
        
        if 'username' in data:
            if User.query.filter(User.username == data['username'], User.id != user_id).first():
                raise ValueError('Username already taken')
            user.username = data['username']
        
        if 'first_name' in data:
            user.first_name = data['first_name']
        
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        if 'role' in data:
            user.role = UserRole(data['role'])
        
        if 'password' in data:
            user.set_password(data['password'])
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return user
    
    @staticmethod
    def delete_user(user_id):
        """Delete a user"""
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        
        db.session.delete(user)
        db.session.commit()
        
        return True
    
    @staticmethod
    def assign_patient_to_doctor(doctor_id, patient_id):
        """Assign a patient to a doctor"""
        from app.models.patient import Patient
        from app.models.user import patient_assignments
        
        doctor = User.query.get(doctor_id)
        patient = Patient.query.get(patient_id)
        
        if not doctor or doctor.role != UserRole.DOCTOR:
            raise ValueError('Invalid doctor')
        if not patient:
            raise ValueError('Patient not found')
        
        # Check if already assigned
        if patient in doctor.assigned_patients:
            raise ValueError('Patient already assigned to this doctor')
        
        doctor.assigned_patients.append(patient)
        db.session.commit()
        
        return True
    
    @staticmethod
    def remove_patient_from_doctor(doctor_id, patient_id):
        """Remove patient assignment from doctor"""
        from app.models.patient import Patient
        
        doctor = User.query.get(doctor_id)
        patient = Patient.query.get(patient_id)
        
        if not doctor or not patient:
            raise ValueError('Doctor or patient not found')
        
        if patient in doctor.assigned_patients:
            doctor.assigned_patients.remove(patient)
            db.session.commit()
        
        return True
    
    @staticmethod
    def get_audit_logs(user_id=None, page=1, per_page=20):
        """Get audit logs"""
        query = AuditLog.query
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        return query.order_by(AuditLog.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def _validate_email(email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def authenticate_user(email_or_username, password):
        """Authenticate user with email/username and password"""
        user = UserService.get_user_by_email(email_or_username)
        if not user:
            user = UserService.get_user_by_username(email_or_username)
        
        if not user or not user.check_password(password):
            return None
        
        if not user.is_active:
            raise ValueError('User account is inactive')
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return user
