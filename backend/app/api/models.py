from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.model_service import ModelService
from app.auth.decorators import require_permission, admin_required, audit_log
from app.models.user import PermissionType
from app.models.model_management import ModelStatus, ModelType

models_bp = Blueprint('models', __name__)

@models_bp.route('/', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.MANAGE_MODELS)
def get_models():
    """Get all AI models"""
    try:
        model_type = request.args.get('model_type')
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = ModelService.get_all_models(model_type, status, page, per_page)
        
        return jsonify({
            'models': [model.to_dict() for model in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
@audit_log('model_create', resource_type='AIModel')
def create_model():
    """Create a new AI model"""
    try:
        data = request.get_json()
        
        if 'model_name' not in data or 'model_type' not in data or 'version' not in data:
            return jsonify({'error': 'model_name, model_type, and version are required'}), 400
        
        model = ModelService.create_model(data)
        
        return jsonify({
            'message': 'Model created successfully',
            'model': model.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/<int:model_id>', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.MANAGE_MODELS)
def get_model(model_id):
    """Get model by ID"""
    try:
        model = ModelService.get_model(model_id)
        
        if not model:
            return jsonify({'error': 'Model not found'}), 404
        
        return jsonify({'model': model.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/<int:model_id>', methods=['PUT'])
@jwt_required()
@admin_required
@audit_log('model_update', resource_type='AIModel', resource_id=lambda: request.view_args.get('model_id'))
def update_model(model_id):
    """Update model information"""
    try:
        data = request.get_json()
        model = ModelService.update_model(model_id, data)
        
        return jsonify({
            'message': 'Model updated successfully',
            'model': model.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/<int:model_id>', methods=['DELETE'])
@jwt_required()
@admin_required
@audit_log('model_delete', resource_type='AIModel', resource_id=lambda: request.view_args.get('model_id'))
def delete_model(model_id):
    """Delete a model"""
    try:
        ModelService.delete_model(model_id)
        
        return jsonify({'message': 'Model deleted successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/<int:model_id>/deploy', methods=['POST'])
@jwt_required()
@admin_required
@audit_log('model_deploy', resource_type='AIModel', resource_id=lambda: request.view_args.get('model_id'))
def deploy_model(model_id):
    """Deploy a model"""
    try:
        data = request.get_json()
        deployment_endpoint = data.get('deployment_endpoint')
        
        if not deployment_endpoint:
            return jsonify({'error': 'deployment_endpoint is required'}), 400
        
        model = ModelService.deploy_model(model_id, deployment_endpoint)
        
        return jsonify({
            'message': 'Model deployed successfully',
            'model': model.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/<int:model_id>/deactivate', methods=['POST'])
@jwt_required()
@admin_required
@audit_log('model_deactivate', resource_type='AIModel', resource_id=lambda: request.view_args.get('model_id'))
def deactivate_model(model_id):
    """Deactivate a deployed model"""
    try:
        model = ModelService.deactivate_model(model_id)
        
        return jsonify({
            'message': 'Model deactivated successfully',
            'model': model.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/<int:model_id>/evaluations', methods=['POST'])
@jwt_required()
@admin_required
@audit_log('model_evaluation_create', resource_type='ModelEvaluation')
def create_model_evaluation(model_id):
    """Create a model evaluation"""
    try:
        data = request.get_json()
        evaluation = ModelService.create_model_evaluation(model_id, data)
        
        return jsonify({
            'message': 'Model evaluation created successfully',
            'evaluation': evaluation.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/<int:model_id>/evaluations', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.MANAGE_MODELS)
def get_model_evaluations(model_id):
    """Get evaluations for a model"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = ModelService.get_model_evaluations(model_id, page, per_page)
        
        return jsonify({
            'evaluations': [eval.to_dict() for eval in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/training-jobs', methods=['POST'])
@jwt_required()
@admin_required
@audit_log('training_job_create', resource_type='ModelTrainingJob')
def create_training_job():
    """Create a model training job"""
    try:
        data = request.get_json()
        
        if 'job_name' not in data:
            return jsonify({'error': 'job_name is required'}), 400
        
        model_id = data.get('model_id')
        training_job = ModelService.create_training_job(model_id, data)
        
        return jsonify({
            'message': 'Training job created successfully',
            'training_job': training_job.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/training-jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
@admin_required
@audit_log('training_job_update', resource_type='ModelTrainingJob', resource_id=lambda: request.view_args.get('job_id'))
def update_training_job(job_id):
    """Update training job progress"""
    try:
        data = request.get_json()
        training_job = ModelService.update_training_job(job_id, data)
        
        return jsonify({
            'message': 'Training job updated successfully',
            'training_job': training_job.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/training-jobs', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.MANAGE_MODELS)
def get_training_jobs():
    """Get training jobs"""
    try:
        model_id = request.args.get('model_id', type=int)
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = ModelService.get_training_jobs(model_id, status, page, per_page)
        
        return jsonify({
            'training_jobs': [job.to_dict() for job in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/active/<model_type>', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.MANAGE_MODELS)
def get_active_model(model_type):
    """Get the currently active model for a given type"""
    try:
        model = ModelService.get_active_model_by_type(model_type)
        
        if not model:
            return jsonify({'error': 'No active model found for this type'}), 404
        
        return jsonify({'model': model.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/compare', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.MANAGE_MODELS)
def compare_models():
    """Compare multiple models"""
    try:
        data = request.get_json()
        model_ids = data.get('model_ids', [])
        
        if not model_ids:
            return jsonify({'error': 'model_ids is required'}), 400
        
        comparison = ModelService.compare_models(model_ids)
        
        return jsonify({'comparison': comparison}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@models_bp.route('/types', methods=['GET'])
@jwt_required()
def get_model_types():
    """Get available model types"""
    try:
        model_types = [
            {'name': model_type.value, 'description': model_type.name.replace('_', ' ').title()}
            for model_type in ModelType
        ]
        
        return jsonify({'model_types': model_types}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
