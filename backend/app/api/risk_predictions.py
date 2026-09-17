from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.risk_prediction_service import RiskPredictionService
from app.auth.decorators import require_permission, audit_log
from app.models.user import PermissionType
from app.auth.jwt_handler import get_current_user

risk_predictions_bp = Blueprint('risk_predictions', __name__)

@risk_predictions_bp.route('/patient/<int:patient_id>', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
@audit_log('risk_prediction_create', resource_type='RiskPrediction')
def create_risk_prediction(patient_id):
    """Create a risk prediction for a patient"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only create predictions for assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        risk_prediction = RiskPredictionService.create_risk_prediction(patient_id)
        
        return jsonify({
            'message': 'Risk prediction created successfully',
            'risk_prediction': risk_prediction.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@risk_predictions_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
def get_risk_predictions(patient_id):
    """Get risk predictions for a patient"""
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
        
        pagination = RiskPredictionService.get_risk_predictions(patient_id, page, per_page)
        
        # Researchers get aggregated data only
        if current_user.role.value == 'healthcare_researcher':
            # Return aggregated statistics instead of individual predictions
            predictions = pagination.items
            if predictions:
                avg_risk_score = sum(p.risk_score for p in predictions) / len(predictions)
                risk_distribution = {}
                for p in predictions:
                    category = p.risk_category.value
                    risk_distribution[category] = risk_distribution.get(category, 0) + 1
                
                return jsonify({
                    'aggregated_data': {
                        'average_risk_score': round(avg_risk_score, 2),
                        'risk_distribution': risk_distribution,
                        'total_predictions': len(predictions)
                    }
                }), 200
        
        return jsonify({
            'risk_predictions': [rp.to_dict() for rp in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@risk_predictions_bp.route('/readmission/patient/<int:patient_id>', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_READMISSION_FORECASTS)
@audit_log('readmission_prediction_create', resource_type='ReadmissionPrediction')
def create_readmission_prediction(patient_id):
    """Create a readmission prediction for a patient"""
    try:
        current_user = get_current_user()
        from app.models.patient import Patient
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Doctors can only create predictions for assigned patients
        if current_user.role.value == 'doctor' and patient not in current_user.assigned_patients:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        admission_id = request.json.get('admission_id') if request.json else None
        readmission_prediction = RiskPredictionService.create_readmission_prediction(patient_id, admission_id)
        
        return jsonify({
            'message': 'Readmission prediction created successfully',
            'readmission_prediction': readmission_prediction.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@risk_predictions_bp.route('/readmission/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_READMISSION_FORECASTS)
def get_readmission_predictions(patient_id):
    """Get readmission predictions for a patient"""
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
        
        pagination = RiskPredictionService.get_readmission_predictions(patient_id, page, per_page)
        
        # Researchers get aggregated data only
        if current_user.role.value == 'healthcare_researcher':
            predictions = pagination.items
            if predictions:
                avg_probability = sum(p.readmission_probability for p in predictions) / len(predictions)
                risk_distribution = {}
                for p in predictions:
                    category = p.readmission_risk_category.value
                    risk_distribution[category] = risk_distribution.get(category, 0) + 1
                
                return jsonify({
                    'aggregated_data': {
                        'average_readmission_probability': round(avg_probability, 3),
                        'risk_distribution': risk_distribution,
                        'total_predictions': len(predictions)
                    }
                }), 200
        
        return jsonify({
            'readmission_predictions': [rp.to_dict() for rp in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@risk_predictions_bp.route('/high-risk', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
def get_high_risk_patients():
    """Get patients with high risk scores"""
    try:
        current_user = get_current_user()
        threshold = request.args.get('threshold', 70, type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = RiskPredictionService.get_high_risk_patients(threshold, page, per_page)
        
        # Filter for doctors - only show assigned patients
        if current_user.role.value == 'doctor':
            assigned_patient_ids = [p.id for p in current_user.assigned_patients]
            filtered_predictions = [rp for rp in pagination.items if rp.patient_id in assigned_patient_ids]
            
            return jsonify({
                'high_risk_patients': [rp.to_dict() for rp in filtered_predictions],
                'total': len(filtered_predictions),
                'pages': 1,
                'current_page': page
            }), 200
        
        # Researchers get aggregated data only
        if current_user.role.value == 'healthcare_researcher':
            predictions = pagination.items
            if predictions:
                avg_risk_score = sum(p.risk_score for p in predictions) / len(predictions)
                risk_distribution = {}
                for p in predictions:
                    category = p.risk_category.value
                    risk_distribution[category] = risk_distribution.get(category, 0) + 1
                
                return jsonify({
                    'aggregated_data': {
                        'average_risk_score': round(avg_risk_score, 2),
                        'risk_distribution': risk_distribution,
                        'total_high_risk_patients': len(predictions),
                        'threshold': threshold
                    }
                }), 200
        
        return jsonify({
            'high_risk_patients': [rp.to_dict() for rp in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@risk_predictions_bp.route('/batch', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_RISK_PREDICTIONS)
@audit_log('batch_risk_prediction', resource_type='RiskPrediction')
def create_batch_risk_predictions():
    """Create risk predictions for multiple patients"""
    try:
        data = request.get_json()
        patient_ids = data.get('patient_ids', [])
        
        if not patient_ids:
            return jsonify({'error': 'patient_ids is required'}), 400
        
        current_user = get_current_user()
        from app.models.patient import Patient
        
        # Filter patients based on user role
        if current_user.role.value == 'doctor':
            assigned_patient_ids = [p.id for p in current_user.assigned_patients]
            patient_ids = [pid for pid in patient_ids if pid in assigned_patient_ids]
        
        results = []
        for patient_id in patient_ids:
            try:
                risk_prediction = RiskPredictionService.create_risk_prediction(patient_id)
                results.append({
                    'patient_id': patient_id,
                    'success': True,
                    'risk_prediction': risk_prediction.to_dict()
                })
            except Exception as e:
                results.append({
                    'patient_id': patient_id,
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'message': 'Batch risk predictions completed',
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
