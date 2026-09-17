from functools import wraps
from flask import jsonify, request, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User, PermissionType
from app.auth.jwt_handler import get_current_user
from app.models.user import AuditLog
from datetime import datetime

def require_permission(permission):
    """Decorator to require specific permission"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()
            
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            
            if not user.has_permission(permission):
                return jsonify({
                    'error': 'Insufficient permissions',
                    'required_permission': permission.value
                }), 403
            
            g.current_user = user
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_role(role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()
            
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            
            if user.role != role:
                return jsonify({
                    'error': 'Insufficient role privileges',
                    'required_role': role.value
                }), 403
            
            g.current_user = user
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def audit_log(action, resource_type=None, resource_id=None):
    """Decorator to log user actions"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Execute the function first
            response = f(*args, **kwargs)
            
            # Log the action if user is authenticated
            try:
                user = get_current_user()
                if user:
                    log_entry = AuditLog(
                        user_id=user.id,
                        action=action,
                        resource_type=resource_type,
                        resource_id=resource_id,
                        ip_address=request.remote_addr,
                        user_agent=request.headers.get('User-Agent'),
                        details={
                            'endpoint': request.endpoint,
                            'method': request.method,
                            'path': request.path
                        }
                    )
                    from app import db
                    db.session.add(log_entry)
                    db.session.commit()
            except Exception:
                # Don't break the request if logging fails
                pass
            
            return response
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator to require system administrator role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        user = get_current_user()
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 401
        
        if user.role != User.Role.SYSTEM_ADMINISTRATOR:
            return jsonify({'error': 'System administrator access required'}), 403
        
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function
