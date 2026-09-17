from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.analytics_service import AnalyticsService
from app.auth.decorators import require_permission, audit_log
from app.models.user import PermissionType
from app.auth.jwt_handler import get_current_user

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/hospital/performance/generate', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_HOSPITAL_ANALYTICS)
@audit_log('hospital_performance_generate', resource_type='HospitalPerformance')
def generate_hospital_performance_report():
    """Generate hospital performance report"""
    try:
        data = request.get_json()
        hospital_id = data.get('hospital_id')
        department = data.get('department')
        time_period = data.get('time_period', 'monthly')
        
        performance = AnalyticsService.generate_hospital_performance_report(
            hospital_id, department, time_period
        )
        
        return jsonify({
            'message': 'Hospital performance report generated successfully',
            'performance': performance.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/hospital/performance', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_HOSPITAL_ANALYTICS)
def get_hospital_performance():
    """Get hospital performance reports"""
    try:
        current_user = get_current_user()
        hospital_id = request.args.get('hospital_id')
        department = request.args.get('department')
        time_period = request.args.get('time_period', 'monthly')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Researchers get aggregated data only
        if current_user.role.value == 'healthcare_researcher':
            # Return aggregated statistics instead of individual reports
            pagination = AnalyticsService.get_hospital_performance(
                hospital_id, department, time_period, page, per_page
            )
            
            if pagination.items:
                avg_readmission_rate = sum(p.readmission_rate or 0 for p in pagination.items) / len(pagination.items)
                avg_los = sum(p.average_length_of_stay or 0 for p in pagination.items) / len(pagination.items)
                avg_quality = sum(p.quality_score or 0 for p in pagination.items) / len(pagination.items)
                
                return jsonify({
                    'aggregated_data': {
                        'average_readmission_rate': round(avg_readmission_rate, 2),
                        'average_length_of_stay': round(avg_los, 2),
                        'average_quality_score': round(avg_quality, 2),
                        'total_reports': len(pagination.items)
                    }
                }), 200
        
        pagination = AnalyticsService.get_hospital_performance(
            hospital_id, department, time_period, page, per_page
        )
        
        return jsonify({
            'hospital_performance': [hp.to_dict() for hp in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/patient/<int:patient_id>/outcome/generate', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_HOSPITAL_ANALYTICS)
@audit_log('patient_outcome_generate', resource_type='PatientOutcome')
def generate_patient_outcome_report(patient_id):
    """Generate patient outcome report"""
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
        
        patient_outcome = AnalyticsService.generate_patient_outcome_report(patient_id, admission_id)
        
        return jsonify({
            'message': 'Patient outcome report generated successfully',
            'patient_outcome': patient_outcome.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/patient/<int:patient_id>/outcomes', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_HOSPITAL_ANALYTICS)
def get_patient_outcomes(patient_id):
    """Get patient outcomes"""
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
        
        pagination = AnalyticsService.get_patient_outcomes(patient_id, page, per_page)
        
        return jsonify({
            'patient_outcomes': [po.to_dict() for po in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/trends/analyze', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.VIEW_POPULATION_HEALTH)
@audit_log('healthcare_trend_analyze', resource_type='HealthcareTrend')
def analyze_healthcare_trends():
    """Analyze healthcare trends"""
    try:
        data = request.get_json()
        trend_category = data.get('trend_category', 'readmission_rate')
        time_period = data.get('time_period', 'monthly')
        
        healthcare_trend = AnalyticsService.analyze_healthcare_trends(trend_category, time_period)
        
        return jsonify({
            'message': 'Healthcare trend analyzed successfully',
            'healthcare_trend': healthcare_trend.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/trends', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_POPULATION_HEALTH)
def get_healthcare_trends():
    """Get healthcare trends"""
    try:
        trend_category = request.args.get('trend_category')
        time_period = request.args.get('time_period', 'monthly')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = AnalyticsService.get_healthcare_trends(trend_category, time_period, page, per_page)
        
        return jsonify({
            'healthcare_trends': [ht.to_dict() for ht in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/dashboard/summary', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_HOSPITAL_ANALYTICS)
def get_dashboard_summary():
    """Get dashboard summary data"""
    try:
        summary = AnalyticsService.get_dashboard_summary()
        
        return jsonify({'summary': summary}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/population-health', methods=['GET'])
@jwt_required()
@require_permission(PermissionType.VIEW_POPULATION_HEALTH)
def get_population_health_stats():
    """Get population health statistics"""
    try:
        from app.models.patient import Patient
        from app.models.risk_prediction import RiskPrediction
        from sqlalchemy import func
        
        # Get overall statistics
        total_patients = Patient.query.count()
        active_patients = Patient.query.filter_by(is_active=True).count()
        
        # Age distribution
        from datetime import datetime
        today = datetime.now().date()
        age_groups = {
            '0-18': 0,
            '19-35': 0,
            '36-50': 0,
            '51-65': 0,
            '65+': 0
        }
        
        patients = Patient.query.all()
        for patient in patients:
            age = (today - patient.date_of_birth).days // 365
            if age <= 18:
                age_groups['0-18'] += 1
            elif age <= 35:
                age_groups['19-35'] += 1
            elif age <= 50:
                age_groups['36-50'] += 1
            elif age <= 65:
                age_groups['51-65'] += 1
            else:
                age_groups['65+'] += 1
        
        # Risk distribution
        risk_predictions = RiskPrediction.query.all()
        risk_distribution = {
            'low': 0,
            'medium': 0,
            'high': 0,
            'critical': 0
        }
        
        for prediction in risk_predictions:
            category = prediction.risk_category.value
            risk_distribution[category] = risk_distribution.get(category, 0) + 1
        
        # Gender distribution
        gender_distribution = {
            'male': 0,
            'female': 0,
            'other': 0
        }
        
        for patient in patients:
            gender = patient.gender.value
            gender_distribution[gender] = gender_distribution.get(gender, 0) + 1
        
        return jsonify({
            'population_health': {
                'total_patients': total_patients,
                'active_patients': active_patients,
                'age_distribution': age_groups,
                'risk_distribution': risk_distribution,
                'gender_distribution': gender_distribution
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@analytics_bp.route('/export', methods=['POST'])
@jwt_required()
@require_permission(PermissionType.EXPORT_RESEARCH_DATASETS)
@audit_log('analytics_export', resource_type='Analytics')
def export_analytics_report():
    """Export analytics report"""
    try:
        data = request.get_json()
        report_type = data.get('report_type', 'hospital_performance')
        format_type = data.get('format', 'json')
        
        # In production, this would generate PDF/Excel reports
        # For now, we'll return JSON data
        
        if report_type == 'hospital_performance':
            pagination = AnalyticsService.get_hospital_performance(
                data.get('hospital_id'),
                data.get('department'),
                data.get('time_period', 'monthly'),
                1,
                1000
            )
            export_data = [hp.to_dict() for hp in pagination.items]
        elif report_type == 'patient_outcomes':
            patient_id = data.get('patient_id')
            if patient_id:
                pagination = AnalyticsService.get_patient_outcomes(patient_id, 1, 1000)
                export_data = [po.to_dict() for po in pagination.items]
            else:
                export_data = []
        elif report_type == 'healthcare_trends':
            pagination = AnalyticsService.get_healthcare_trends(
                data.get('trend_category'),
                data.get('time_period', 'monthly'),
                1,
                1000
            )
            export_data = [ht.to_dict() for ht in pagination.items]
        else:
            return jsonify({'error': 'Invalid report type'}), 400
        
        return jsonify({
            'message': 'Report exported successfully',
            'report_type': report_type,
            'format': format_type,
            'data': export_data,
            'record_count': len(export_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
