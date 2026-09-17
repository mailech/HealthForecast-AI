from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.user_service import UserService
from app.auth.decorators import require_permission, admin_required, audit_log
from app.models.user import PermissionType, UserRole

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.MANAGE_USERS)
def get_users():
    """Get all users"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role = request.args.get('role')
        
        pagination = UserService.get_all_users(page=page, per_page=per_page, role=role)
        
        return jsonify({
            'users': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user by ID"""
    try:
        from app.auth.jwt_handler import get_current_user
        current_user = get_current_user()
        
        # Users can only view their own profile unless they're admin
        if current_user.id != user_id and not current_user.has_permission(PermissionType.MANAGE_USERS):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        user = UserService.get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
@audit_log('user_create', resource_type='User')
def create_user():
    """Create a new user (admin only)"""
    try:
        data = request.get_json()
        
        user = UserService.create_user(data)
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
@audit_log('user_update', resource_type='User', resource_id=lambda: request.view_args.get('user_id'))
def update_user(user_id):
    """Update user"""
    try:
        from app.auth.jwt_handler import get_current_user
        current_user = get_current_user()
        
        # Users can only update their own profile unless they're admin
        if current_user.id != user_id and not current_user.has_permission(PermissionType.MANAGE_USERS):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        
        # Non-admin users cannot change their role
        if 'role' in data and not current_user.has_permission(PermissionType.MANAGE_USERS):
            del data['role']
        
        user = UserService.update_user(user_id, data)
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
@audit_log('user_delete', resource_type='User', resource_id=lambda: request.view_args.get('user_id'))
def delete_user(user_id):
    """Delete user (admin only)"""
    try:
        UserService.delete_user(user_id)
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/roles', methods=['GET'])
@jwt_required()
def get_roles():
    """Get all available roles"""
    try:
        roles = [
            {
                'name': role.value,
                'permissions': [p.value for p in PermissionType if p in UserRole(role.value)]
            }
            for role in UserRole
        ]
        
        return jsonify({'roles': roles}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/permissions', methods=['GET'])
@jwt_required()
def get_permissions():
    """Get all available permissions"""
    try:
        permissions = [
            {
                'name': permission.value,
                'category': permission.name.split('_')[0] if '_' in permission.value else 'general'
            }
            for permission in PermissionType
        ]
        
        return jsonify({'permissions': permissions}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<int:user_id>/patients', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_PATIENT_RECORDS)
@audit_log('patient_assign', resource_type='Patient')
def assign_patient(user_id):
    """Assign patient to doctor"""
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        
        if not patient_id:
            return jsonify({'error': 'patient_id is required'}), 400
        
        UserService.assign_patient_to_doctor(user_id, patient_id)
        
        return jsonify({'message': 'Patient assigned successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<int:user_id>/patients/<int:patient_id>', methods=['DELETE'])
@jwt_required()
@require_permission(PermissionType.VIEW_PATIENT_RECORDS)
@audit_log('patient_unassign', resource_type='Patient')
def remove_patient(user_id, patient_id):
    """Remove patient assignment from doctor"""
    try:
        UserService.remove_patient_from_doctor(user_id, patient_id)
        
        return jsonify({'message': 'Patient removed successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@admin_required
def get_audit_logs():
    """Get audit logs (admin only)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        user_id = request.args.get('user_id', type=int)
        
        pagination = UserService.get_audit_logs(user_id=user_id, page=page, per_page=per_page)
        
        return jsonify({
            'audit_logs': [log.to_dict() for log in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
