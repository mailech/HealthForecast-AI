from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.clinical_decision_service import ClinicalDecisionService
from app.auth.decorators import require_permission, audit_log
from app.models.user import PermissionType
from app.auth.jwt_handler import get_current_user

clinical_decisions_bp = Blueprint('clinical_decisions', __name__)

@clinical_decisions_bp.route('/patient/<int:patient_id>/recommendations/generate', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
@audit_log('care_recommendations_generate', resource_type='CareRecommendation')
def generate_care_recommendations(patient_id):
    """Generate AI-powered care recommendations for a patient"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only generate for assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        admission_id = request.json.get('admission_id') if request.json else None
        recommendations = ClinicalDecisionService.generate_care_recommendations(patient_id, admission_id)
        
        return jsonify({
            'message': 'Care recommendations generated successfully',
            'recommendations': [r.to_dict() for r in recommendations]
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@clinical_decisions_bp.route('/patient/<int:patient_id>/recommendations', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
@audit_log('care_recommendation_create', resource_type='CareRecommendation')
def create_care_recommendation(patient_id):
    """Create a manual care recommendation"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only create for assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        data = request.get_json()
        
        if 'title' not in data or 'description' not in data:
            return jsonify({'error': 'title and description are required'}), 400
        
        care_recommendation = ClinicalDecisionService.create_care_recommendation(patient_id, data)
        
        return jsonify({
            'message': 'Care recommendation created successfully',
            'care_recommendation': care_recommendation.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@clinical_decisions_bp.route('/patient/<int:patient_id>/recommendations', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
def get_care_recommendations(patient_id):
    """Get care recommendations for a patient"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only view assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        pagination = ClinicalDecisionService.get_care_recommendations(patient_id, page, per_page, status)
        
        return jsonify({
            'care_recommendations': [cr.to_dict() for cr in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@clinical_decisions_bp.route('/recommendations/<int:recommendation_id>/status', methods=['PUT'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
@audit_log('care_recommendation_update', resource_type='CareRecommendation', resource_id=lambda: request.view_args.get('recommendation_id'))
def update_recommendation_status(recommendation_id):
    """Update care recommendation status"""
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'status is required'}), 400
        
        recommendation = ClinicalDecisionService.update_recommendation_status(
            recommendation_id,
            data['status'],
            data.get('outcome'),
            data.get('effectiveness')
        )
        
        return jsonify({
            'message': 'Recommendation status updated successfully',
            'care_recommendation': recommendation.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@clinical_decisions_bp.route('/patient/<int:patient_id>/follow-up-plans', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
@audit_log('follow_up_plan_create', resource_type='FollowUpPlan')
def create_follow_up_plan(patient_id):
    """Create a follow-up plan for patient care"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only create for assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        data = request.get_json()
        admission_id = data.get('admission_id')
        
        if not admission_id:
            return jsonify({'error': 'admission_id is required'}), 400
        
        follow_up_plan = ClinicalDecisionService.create_follow_up_plan(patient_id, admission_id, data)
        
        return jsonify({
            'message': 'Follow-up plan created successfully',
            'follow_up_plan': follow_up_plan.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@clinical_decisions_bp.route('/patient/<int:patient_id>/follow-up-plans', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
def get_follow_up_plans(patient_id):
    """Get follow-up plans for a patient"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only view assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        pagination = ClinicalDecisionService.get_follow_up_plans(patient_id, page, per_page, status)
        
        return jsonify({
            'follow_up_plans': [fup.to_dict() for fup in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@clinical_decisions_bp.route('/follow-up-plans/<int:plan_id>', methods=['PUT'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
@audit_log('follow_up_plan_update', resource_type='FollowUpPlan', resource_id=lambda: request.view_args.get('plan_id'))
def update_follow_up_plan(plan_id):
    """Update follow-up plan"""
    try:
        data = request.get_json()
        
        follow_up_plan = ClinicalDecisionService.update_follow_up_plan(plan_id, data)
        
        return jsonify({
            'message': 'Follow-up plan updated successfully',
            'follow_up_plan': follow_up_plan.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@clinical_decisions_bp.route('/patient/<int:patient_id>/discharge-recommendations', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
def get_discharge_recommendations(patient_id):
    """Generate discharge support recommendations"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only view assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        admission_id = request.args.get('admission_id', type=int)
        
        if not admission_id:
            return jsonify({'error': 'admission_id is required'}), 400
        
        recommendations = ClinicalDecisionService.generate_discharge_recommendations(patient_id, admission_id)
        
        return jsonify({
            'discharge_recommendations': recommendations
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
