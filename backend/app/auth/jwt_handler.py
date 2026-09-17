from datetime import datetime, timedelta
from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, decode_token as jwt_decode
from app.models.user import User
import uuid

def generate_tokens(user):
    """Generate access and refresh tokens for user"""
    # Create tokens with user identity
    access_token = create_access_token(
        identity=user.id,
        additional_claims={
            'role': user.role.value,
            'username': user.username,
            'email': user.email
        }
    )
    
    refresh_token = create_refresh_token(
        identity=user.id,
        additional_claims={
            'role': user.role.value
        }
    )
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer',
        'expires_in': current_app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()
    }

def decode_token(token):
    """Decode and validate JWT token"""
    try:
        decoded = jwt_decode(token)
        return decoded
    except Exception as e:
        return None

def refresh_access_token():
    """Refresh access token using refresh token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return None
        
        return generate_tokens(user)
    except Exception as e:
        return None

def get_current_user():
    """Get current authenticated user from JWT token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        return user
    except Exception:
        return None
