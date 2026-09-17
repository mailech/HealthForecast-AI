from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token
from app.services.user_service import UserService
from app.auth.jwt_handler import generate_tokens, refresh_access_token
from app.auth.decorators import audit_log

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@audit_log('user_register', resource_type='User')
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'username', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create user
        user = UserService.create_user(data)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
@audit_log('user_login', resource_type='User')
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if 'email_or_username' not in data or 'password' not in data:
            return jsonify({'error': 'Email/username and password are required'}), 400
        
        # Authenticate user
        user = UserService.authenticate_user(data['email_or_username'], data['password'])
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate tokens
        tokens = generate_tokens(user)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'tokens': tokens
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        tokens = refresh_access_token()
        
        if not tokens:
            return jsonify({'error': 'Could not refresh token'}), 401
        
        return jsonify(tokens), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    try:
        from app.auth.jwt_handler import get_current_user
        user = get_current_user()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
@audit_log('user_logout', resource_type='User')
def logout():
    """Logout user (client-side token removal)"""
    return jsonify({'message': 'Logout successful'}), 200
