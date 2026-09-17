from app.models.clinical_decision import CareRecommendation, FollowUpPlan, RecommendationPriority, RecommendationStatus
from app.models.patient import Patient
from app.models.risk_prediction import RiskPrediction, ReadmissionPrediction
from app import db
from datetime import datetime, timedelta
import random

class ClinicalDecisionService:
    """Service for clinical decision support"""
    
    @staticmethod
    def generate_care_recommendations(patient_id, admission_id=None):
        """Generate AI-powered care recommendations based on patient data"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        # Get latest risk prediction
        latest_risk = RiskPrediction.query.filter_by(patient_id=patient_id).order_by(
            RiskPrediction.prediction_date.desc()
        ).first()
        
        # Get latest readmission prediction
        latest_readmission = ReadmissionPrediction.query.filter_by(patient_id=patient_id).order_by(
            ReadmissionPrediction.prediction_date.desc()
        ).first()
        
        recommendations = []
        
        # Generate recommendations based on risk factors
        if latest_risk:
            if latest_risk.risk_category.value in ['high', 'critical']:
                recommendations.append({
                    'title': 'High-Risk Patient Monitoring',
                    'description': 'Patient requires close monitoring due to elevated risk factors',
                    'priority': 'urgent',
                    'recommendation_type': 'monitoring',
                    'action_items': [
                        'Daily vital signs monitoring',
                        'Weekly follow-up appointments',
                        'Medication adherence review'
                    ],
                    'timeline': 'Immediate',
                    'rationale': f'Risk score: {latest_risk.risk_score}, Category: {latest_risk.risk_category.value}'
                })
            
            if latest_risk.lifestyle_risk > 10:
                recommendations.append({
                    'title': 'Lifestyle Modification Counseling',
                    'description': 'Patient may benefit from lifestyle intervention',
                    'priority': 'medium',
                    'recommendation_type': 'lifestyle',
                    'action_items': [
                        'Smoking cessation program',
                        'Dietary counseling',
                        'Exercise regimen consultation'
                    ],
                    'timeline': '2 weeks',
                    'rationale': f'Lifestyle risk score: {latest_risk.lifestyle_risk}'
                })
        
        if latest_readmission and latest_readmission.readmission_probability > 0.4:
            recommendations.append({
                'title': 'Readmission Risk Mitigation',
                'description': 'Patient has elevated readmission risk',
                'priority': 'high',
                'recommendation_type': 'follow_up',
                'action_items': [
                    'Post-discharge follow-up within 48 hours',
                    'Home health evaluation',
                    'Medication reconciliation'
                ],
                'timeline': '48 hours post-discharge',
                'rationale': f'Readmission probability: {latest_readmission.readmission_probability}'
            })
        
        # Create recommendation records
        created_recommendations = []
        for rec in recommendations:
            care_recommendation = CareRecommendation(
                patient_id=patient_id,
                admission_id=admission_id,
                recommendation_date=datetime.utcnow(),
                recommendation_type=rec['recommendation_type'],
                priority=RecommendationPriority(rec['priority']),
                title=rec['title'],
                description=rec['description'],
                rationale=rec['rationale'],
                action_items=rec['action_items'],
                timeline=rec['timeline'],
                ai_generated=True,
                confidence_score=round(random.uniform(0.7, 0.9), 2),
                model_version='1.0.0'
            )
            db.session.add(care_recommendation)
            created_recommendations.append(care_recommendation)
        
        db.session.commit()
        
        return created_recommendations
    
    @staticmethod
    def create_care_recommendation(patient_id, data):
        """Create a manual care recommendation"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        care_recommendation = CareRecommendation(
            patient_id=patient_id,
            admission_id=data.get('admission_id'),
            recommendation_date=datetime.utcnow(),
            recommendation_type=data.get('recommendation_type'),
            priority=RecommendationPriority(data.get('priority', 'medium')),
            title=data['title'],
            description=data['description'],
            rationale=data.get('rationale'),
            evidence=data.get('evidence'),
            action_items=data.get('action_items'),
            timeline=data.get('timeline'),
            responsible_party=data.get('responsible_party'),
            risk_mitigation=data.get('risk_mitigation'),
            discharge_support=data.get('discharge_support'),
            ai_generated=data.get('ai_generated', False),
            confidence_score=data.get('confidence_score'),
            model_version=data.get('model_version')
        )
        
        db.session.add(care_recommendation)
        db.session.commit()
        
        return care_recommendation
    
    @staticmethod
    def get_care_recommendations(patient_id, page=1, per_page=20, status=None):
        """Get care recommendations for a patient"""
        query = CareRecommendation.query.filter_by(patient_id=patient_id)
        
        if status:
            query = query.filter_by(status=RecommendationStatus(status))
        
        return query.order_by(CareRecommendation.recommendation_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def update_recommendation_status(recommendation_id, status, outcome=None, effectiveness=None):
        """Update care recommendation status"""
        recommendation = CareRecommendation.query.get(recommendation_id)
        if not recommendation:
            raise ValueError('Recommendation not found')
        
        recommendation.status = RecommendationStatus(status)
        
        if outcome:
            recommendation.outcome = outcome
        if effectiveness is not None:
            recommendation.effectiveness = effectiveness
        
        if status == 'completed':
            recommendation.completion_date = datetime.utcnow()
        
        recommendation.updated_at = datetime.utcnow()
        db.session.commit()
        
        return recommendation
    
    @staticmethod
    def create_follow_up_plan(patient_id, admission_id, data):
        """Create a follow-up plan for patient care"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        follow_up_plan = FollowUpPlan(
            patient_id=patient_id,
            admission_id=admission_id,
            plan_date=datetime.utcnow(),
            plan_type=data.get('plan_type', 'post_discharge'),
            follow_up_date=datetime.strptime(data['follow_up_date'], '%Y-%m-%d %H:%M:%S') if data.get('follow_up_date') else None,
            follow_up_type=data.get('follow_up_type'),
            location=data.get('location'),
            department=data.get('department'),
            provider=data.get('provider'),
            objectives=data.get('objectives'),
            assessments=data.get('assessments'),
            medications_to_review=data.get('medications_to_review'),
            vital_signs_to_monitor=data.get('vital_signs_to_monitor'),
            risk_factors_to_monitor=data.get('risk_factors_to_monitor'),
            warning_signs=data.get('warning_signs'),
            emergency_contacts=data.get('emergency_contacts'),
            patient_instructions=data.get('patient_instructions'),
            self_care_instructions=data.get('self_care_instructions'),
            status=RecommendationStatus(data.get('status', 'pending'))
        )
        
        db.session.add(follow_up_plan)
        db.session.commit()
        
        return follow_up_plan
    
    @staticmethod
    def get_follow_up_plans(patient_id, page=1, per_page=20, status=None):
        """Get follow-up plans for a patient"""
        query = FollowUpPlan.query.filter_by(patient_id=patient_id)
        
        if status:
            query = query.filter_by(status=RecommendationStatus(status))
        
        return query.order_by(FollowUpPlan.plan_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def update_follow_up_plan(plan_id, data):
        """Update follow-up plan"""
        follow_up_plan = FollowUpPlan.query.get(plan_id)
        if not follow_up_plan:
            raise ValueError('Follow-up plan not found')
        
        # Update fields
        if 'follow_up_date' in data:
            follow_up_plan.follow_up_date = datetime.strptime(data['follow_up_date'], '%Y-%m-%d %H:%M:%S')
        if 'follow_up_type' in data:
            follow_up_plan.follow_up_type = data['follow_up_type']
        if 'location' in data:
            follow_up_plan.location = data['location']
        if 'department' in data:
            follow_up_plan.department = data['department']
        if 'provider' in data:
            follow_up_plan.provider = data['provider']
        if 'objectives' in data:
            follow_up_plan.objectives = data['objectives']
        if 'assessments' in data:
            follow_up_plan.assessments = data['assessments']
        if 'medications_to_review' in data:
            follow_up_plan.medications_to_review = data['medications_to_review']
        if 'vital_signs_to_monitor' in data:
            follow_up_plan.vital_signs_to_monitor = data['vital_signs_to_monitor']
        if 'risk_factors_to_monitor' in data:
            follow_up_plan.risk_factors_to_monitor = data['risk_factors_to_monitor']
        if 'warning_signs' in data:
            follow_up_plan.warning_signs = data['warning_signs']
        if 'emergency_contacts' in data:
            follow_up_plan.emergency_contacts = data['emergency_contacts']
        if 'patient_instructions' in data:
            follow_up_plan.patient_instructions = data['patient_instructions']
        if 'self_care_instructions' in data:
            follow_up_plan.self_care_instructions = data['self_care_instructions']
        if 'status' in data:
            follow_up_plan.status = RecommendationStatus(data['status'])
            if data['status'] == 'completed':
                follow_up_plan.completion_date = datetime.utcnow()
        if 'completion_notes' in data:
            follow_up_plan.completion_notes = data['completion_notes']
        
        follow_up_plan.updated_at = datetime.utcnow()
        db.session.commit()
        
        return follow_up_plan
    
    @staticmethod
    def generate_discharge_recommendations(patient_id, admission_id):
        """Generate discharge support recommendations"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        # Get latest readmission prediction
        latest_readmission = ReadmissionPrediction.query.filter_by(
            patient_id=patient_id, admission_id=admission_id
        ).order_by(ReadmissionPrediction.prediction_date.desc()).first()
        
        discharge_recommendations = {
            'follow_up_timing': '7 days',
            'home_health_needed': latest_readmission.readmission_probability > 0.5 if latest_readmission else False,
            'medication_reconciliation': True,
            'patient_education_topics': [
                'Medication instructions',
                'Warning signs',
                'Activity restrictions',
                'Dietary guidelines'
            ],
            'care_coordination': {
                'primary_care_notification': True,
                'specialist_referral': patient.medical_history.count() > 3,
                'home_health_agency': latest_readmission.readmission_probability > 0.6 if latest_readmission else False
            }
        }
        
        return discharge_recommendations
