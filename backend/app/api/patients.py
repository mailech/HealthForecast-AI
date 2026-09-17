from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.patient_service import PatientService
from app.auth.decorators import require_permission, audit_log
from app.models.user import PermissionType
from app.auth.jwt_handler import get_current_user

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_PATIENT_RECORDS)
def get_patients():
    """Get all patients"""
    try:
        current_user = get_current_user()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search')
        
        # Doctors can only see assigned patients
        if current_user.role.value == 'doctor':
            assigned_patient_ids = [p.id for p in current_user.assigned_patients]
            if not assigned_patient_ids:
                return jsonify({'patients': [], 'total': 0, 'pages': 0, 'current_page': page}), 200
            from app.models.patient import Patient
            query = Patient.query.filter(Patient.id.in_(assigned_patient_ids))
            
            if search:
                search_term = f"%{search}%"
                query = query.filter(
                    (Patient.first_name.ilike(search_term)) |
                    (Patient.last_name.ilike(search_term)) |
                    (Patient.patient_id.ilike(search_term))
                )
            
            pagination = query.order_by(Patient.created_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
        else:
            pagination = PatientService.get_all_patients(page=page, per_page=per_page, search=search)
        
        # Researchers get anonymized data
        include_sensitive = current_user.role.value != 'healthcare_researcher'
        
        return jsonify({
            'patients': [p.to_dict(include_sensitive=include_sensitive) for p in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_PATIENT_RECORDS)
def get_patient(patient_id):
    """Get patient by ID"""
    try:
        current_user = get_current_user()
        patient = PatientService.get_patient(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only view assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        # Researchers get anonymized data
        include_sensitive = current_user.role.value != 'healthcare_researcher'
        
        return jsonify({'patient': patient.to_dict(include_sensitive=include_sensitive)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.MODIFY_PATIENT_RECORDS)
@audit_log('patient_create', resource_type='Patient')
def create_patient():
    """Create a new patient"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'date_of_birth', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        patient = PatientService.create_patient(data)
        
        return jsonify({
            'message': 'Patient created successfully',
            'patient': patient.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>', methods=['PUT'])
@jwt_required()
@require_permission(PermissionType.MODIFY_PATIENT_RECORDS)
@audit_log('patient_update', resource_type='Patient', resource_id=lambda: request.view_args.get('patient_id'))
def update_patient(patient_id):
    """Update patient information"""
    try:
        current_user = get_current_user()
        patient = PatientService.get_patient(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Hospital administrators can only view, not modify
        if current_user.role.value == 'hospital_administrator':
            return jsonify({'error': 'Cannot modify patient records'}), 403
        
        data = request.get_json()
        patient = PatientService.update_patient(patient_id, data)
        
        return jsonify({
            'message': 'Patient updated successfully',
            'patient': patient.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>', methods=['DELETE'])
@jwt_required()
@require_permission(PermissionType.MODIFY_PATIENT_RECORDS)
@audit_log('patient_delete', resource_type='Patient', resource_id=lambda: request.view_args.get('patient_id'))
def delete_patient(patient_id):
    """Delete patient"""
    try:
        PatientService.delete_patient(patient_id)
        
        return jsonify({'message': 'Patient deleted successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>/medical-history', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_MEDICAL_HISTORY)
def get_medical_history(patient_id):
    """Get patient medical history"""
    try:
        current_user = get_current_user()
        patient = PatientService.get_patient(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only view assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        medical_history = PatientService.get_medical_history(patient_id)
        
        return jsonify({
            'medical_history': [mh.to_dict() for mh in medical_history]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>/medical-history', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.MODIFY_PATIENT_RECORDS)
@audit_log('medical_history_create', resource_type='MedicalHistory')
def add_medical_history(patient_id):
    """Add medical history entry"""
    try:
        data = request.get_json()
        
        if 'condition' not in data:
            return jsonify({'error': 'condition is required'}), 400
        
        medical_history = PatientService.add_medical_history(patient_id, data)
        
        return jsonify({
            'message': 'Medical history added successfully',
            'medical_history': medical_history.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>/admissions', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_PATIENT_RECORDS)
def get_admissions(patient_id):
    """Get patient admissions"""
    try:
        current_user = get_current_user()
        patient = PatientService.get_patient(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only view assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        admissions = PatientService.get_admissions(patient_id)
        
        return jsonify({
            'admissions': [adm.to_dict() for adm in admissions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>/admissions', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.MODIFY_PATIENT_RECORDS)
@audit_log('admission_create', resource_type='Admission')
def add_admission(patient_id):
    """Add hospital admission"""
    try:
        data = request.get_json()
        
        if 'admission_date' not in data:
            return jsonify({'error': 'admission_date is required'}), 400
        
        admission = PatientService.add_admission(patient_id, data)
        
        return jsonify({
            'message': 'Admission added successfully',
            'admission': admission.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>/treatments', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_PATIENT_RECORDS)
def get_treatments(patient_id):
    """Get patient treatments"""
    try:
        current_user = get_current_user()
        patient = PatientService.get_patient(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only view assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        treatments = PatientService.get_treatments(patient_id)
        
        return jsonify({
            'treatments': [t.to_dict() for t in treatments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@patients_bp.route('/<int:patient_id>/treatments', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.MODIFY_PATIENT_RECORDS)
@audit_log('treatment_create', resource_type='Treatment')
def add_treatment(patient_id):
    """Add treatment record"""
    try:
        data = request.get_json()
        
        if 'treatment_name' not in data or 'start_date' not in data:
            return jsonify({'error': 'treatment_name and start_date are required'}), 400
        
        treatment = PatientService.add_treatment(patient_id, data)
        
        return jsonify({
            'message': 'Treatment added successfully',
            'treatment': treatment.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
