from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.treatment_effectiveness_service import TreatmentEffectivenessService
from app.auth.decorators import require_permission, audit_log
from app.models.user import PermissionType
from app.auth.jwt_handler import get_current_user

treatment_effectiveness_bp = Blueprint('treatment_effectiveness', __name__)

@treatment_effectiveness_bp.route('/patient/<int:patient_id>/outcome', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_TREATMENT_EFFECTIVENESS)
@audit_log('treatment_outcome_create', resource_type='TreatmentOutcome')
def create_treatment_outcome(patient_id):
    """Create a treatment outcome evaluation"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only create outcomes for assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        data = request.get_json()
        treatment_outcome = TreatmentEffectivenessService.create_treatment_outcome(patient_id, data)
        
        return jsonify({
            'message': 'Treatment outcome created successfully',
            'treatment_outcome': treatment_outcome.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@treatment_effectiveness_bp.route('/patient/<int:patient_id>/outcomes', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_TREATMENT_EFFECTIVENESS)
def get_treatment_outcomes(patient_id):
    """Get treatment outcomes for a patient"""
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
        
        pagination = TreatmentEffectivenessService.get_treatment_outcomes(patient_id, page, per_page)
        
        return jsonify({
            'treatment_outcomes': [to.to_dict() for to in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@treatment_effectiveness_bp.route('/treatment/<int:treatment_id>/analysis', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_TREATMENT_EFFECTIVENESS)
def analyze_treatment_effectiveness(treatment_id):
    """Analyze effectiveness of a specific treatment"""
    try:
        analysis = TreatmentEffectivenessService.analyze_treatment_effectiveness(treatment_id)
        
        return jsonify({'analysis': analysis}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@treatment_effectiveness_bp.route('/patient/<int:patient_id>/medication', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_TREATMENT_EFFECTIVENESS)
@audit_log('medication_effectiveness_create', resource_type='MedicationEffectiveness')
def create_medication_effectiveness(patient_id):
    """Create medication effectiveness tracking"""
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
        
        if 'medication_name' not in data or 'start_date' not in data:
            return jsonify({'error': 'medication_name and start_date are required'}), 400
        
        medication_effectiveness = TreatmentEffectivenessService.create_medication_effectiveness(patient_id, data)
        
        return jsonify({
            'message': 'Medication effectiveness created successfully',
            'medication_effectiveness': medication_effectiveness.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@treatment_effectiveness_bp.route('/patient/<int:patient_id>/medications', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_TREATMENT_EFFECTIVENESS)
def get_medication_effectiveness(patient_id):
    """Get medication effectiveness for a patient"""
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
        
        pagination = TreatmentEffectivenessService.get_medication_effectiveness(patient_id, page, per_page)
        
        return jsonify({
            'medication_effectiveness': [me.to_dict() for me in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@treatment_effectiveness_bp.route('/medication/<medication_name>/compare', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_TREATMENT_EFFECTIVENESS)
def compare_medications(medication_name):
    """Compare effectiveness of a medication across patients"""
    try:
        comparison = TreatmentEffectivenessService.compare_medications(medication_name)
        
        return jsonify({'comparison': comparison}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@treatment_effectiveness_bp.route('/hospital/performance', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_HOSPITAL_ANALYTICS)
def get_hospital_treatment_performance():
    """Get hospital treatment performance metrics"""
    try:
        department = request.args.get('department')
        time_period = request.args.get('time_period', 'monthly')
        
        performance = TreatmentEffectivenessService.get_hospital_treatment_performance(department, time_period)
        
        return jsonify({'performance': performance}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
