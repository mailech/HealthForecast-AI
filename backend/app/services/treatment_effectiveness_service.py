from app.models.treatment_effectiveness import TreatmentOutcome, MedicationEffectiveness, OutcomeStatus
from app.models.patient import Patient, Treatment
from app import db
from datetime import datetime
import random

class TreatmentEffectivenessService:
    """Service for treatment effectiveness analysis"""
    
    @staticmethod
    def create_treatment_outcome(patient_id, data):
        """Create a treatment outcome evaluation"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        treatment_outcome = TreatmentOutcome(
            patient_id=patient_id,
            treatment_id=data.get('treatment_id'),
            admission_id=data.get('admission_id'),
            evaluation_date=datetime.utcnow(),
            treatment_type=data.get('treatment_type'),
            outcome_status=OutcomeStatus(data.get('outcome_status', 'unknown')),
            effectiveness_score=data.get('effectiveness_score'),
            recovery_rate=data.get('recovery_rate'),
            symptom_improvement=data.get('symptom_improvement'),
            quality_of_life_change=data.get('quality_of_life_change'),
            time_to_improvement=data.get('time_to_improvement'),
            time_to_recovery=data.get('time_to_recovery'),
            expected_outcome=data.get('expected_outcome'),
            outcome_comparison=data.get('outcome_comparison'),
            complications=data.get('complications'),
            side_effects=data.get('side_effects'),
            patient_satisfaction=data.get('patient_satisfaction'),
            notes=data.get('notes')
        )
        
        db.session.add(treatment_outcome)
        db.session.commit()
        
        return treatment_outcome
    
    @staticmethod
    def get_treatment_outcomes(patient_id, page=1, per_page=20):
        """Get treatment outcomes for a patient"""
        return TreatmentOutcome.query.filter_by(patient_id=patient_id).order_by(
            TreatmentOutcome.evaluation_date.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
    
    @staticmethod
    def analyze_treatment_effectiveness(treatment_id):
        """Analyze effectiveness of a specific treatment"""
        treatment = Treatment.query.get(treatment_id)
        if not treatment:
            raise ValueError('Treatment not found')
        
        outcomes = TreatmentOutcome.query.filter_by(treatment_id=treatment_id).all()
        
        if not outcomes:
            return {
                'treatment_id': treatment_id,
                'total_outcomes': 0,
                'average_effectiveness': 0,
                'success_rate': 0,
                'average_recovery_time': 0
            }
        
        total_outcomes = len(outcomes)
        avg_effectiveness = sum(o.effectiveness_score or 0 for o in outcomes) / total_outcomes
        successful_outcomes = sum(1 for o in outcomes if o.outcome_status == OutcomeStatus.SUCCESSFUL)
        success_rate = (successful_outcomes / total_outcomes) * 100
        avg_recovery_time = sum(o.time_to_recovery or 0 for o in outcomes) / total_outcomes
        
        return {
            'treatment_id': treatment_id,
            'treatment_name': treatment.treatment_name,
            'total_outcomes': total_outcomes,
            'average_effectiveness': round(avg_effectiveness, 2),
            'success_rate': round(success_rate, 2),
            'average_recovery_time': round(avg_recovery_time, 2),
            'outcome_distribution': {
                'successful': successful_outcomes,
                'partial': sum(1 for o in outcomes if o.outcome_status == OutcomeStatus.PARTIAL),
                'unsuccessful': sum(1 for o in outcomes if o.outcome_status == OutcomeStatus.UNSUCCESSFUL)
            }
        }
    
    @staticmethod
    def create_medication_effectiveness(patient_id, data):
        """Create medication effectiveness tracking"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        medication_effectiveness = MedicationEffectiveness(
            patient_id=patient_id,
            treatment_id=data.get('treatment_id'),
            medication_name=data['medication_name'],
            medication_type=data.get('medication_type'),
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d %H:%M:%S'),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d %H:%M:%S') if data.get('end_date') else None,
            effectiveness_score=data.get('effectiveness_score'),
            adherence_rate=data.get('adherence_rate'),
            response_rate=data.get('response_rate'),
            symptom_relief=data.get('symptom_relief'),
            biomarker_improvement=data.get('biomarker_improvement'),
            vital_signs_change=data.get('vital_signs_change'),
            side_effects=data.get('side_effects'),
            adverse_events=data.get('adverse_events'),
            drug_interactions=data.get('drug_interactions'),
            alternative_medications=data.get('alternative_medications'),
            comparative_effectiveness=data.get('comparative_effectiveness'),
            notes=data.get('notes')
        )
        
        db.session.add(medication_effectiveness)
        db.session.commit()
        
        return medication_effectiveness
    
    @staticmethod
    def get_medication_effectiveness(patient_id, page=1, per_page=20):
        """Get medication effectiveness for a patient"""
        return MedicationEffectiveness.query.filter_by(patient_id=patient_id).order_by(
            MedicationEffectiveness.start_date.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
    
    @staticmethod
    def compare_medications(medication_name):
        """Compare effectiveness of a medication across patients"""
        medications = MedicationEffectiveness.query.filter_by(
            medication_name=medication_name
        ).all()
        
        if not medications:
            return {
                'medication_name': medication_name,
                'total_records': 0,
                'average_effectiveness': 0,
                'average_adherence': 0
            }
        
        total_records = len(medications)
        avg_effectiveness = sum(m.effectiveness_score or 0 for m in medications) / total_records
        avg_adherence = sum(m.adherence_rate or 0 for m in medications) / total_records
        
        side_effects_count = sum(1 for m in medications if m.side_effects)
        adverse_events_count = sum(1 for m in medications if m.adverse_events)
        
        return {
            'medication_name': medication_name,
            'total_records': total_records,
            'average_effectiveness': round(avg_effectiveness, 2),
            'average_adherence': round(avg_adherence, 2),
            'side_effects_rate': round((side_effects_count / total_records) * 100, 2),
            'adverse_events_rate': round((adverse_events_count / total_records) * 100, 2)
        }
    
    @staticmethod
    def get_hospital_treatment_performance(department=None, time_period='monthly'):
        """Get hospital treatment performance metrics"""
        query = TreatmentOutcome.query
        
        # Filter by department if specified
        if department:
            from app.models.patient import Admission
            admission_ids = [a.id for a in Admission.query.filter_by(department=department).all()]
            query = query.filter(TreatmentOutcome.admission_id.in_(admission_ids))
        
        outcomes = query.all()
        
        if not outcomes:
            return {
                'total_outcomes': 0,
                'average_effectiveness': 0,
                'success_rate': 0,
                'department': department
            }
        
        total_outcomes = len(outcomes)
        avg_effectiveness = sum(o.effectiveness_score or 0 for o in outcomes) / total_outcomes
        successful_outcomes = sum(1 for o in outcomes if o.outcome_status == OutcomeStatus.SUCCESSFUL)
        success_rate = (successful_outcomes / total_outcomes) * 100
        
        # Group by treatment type
        treatment_types = {}
        for outcome in outcomes:
            t_type = outcome.treatment_type or 'unknown'
            if t_type not in treatment_types:
                treatment_types[t_type] = {'count': 0, 'avg_effectiveness': 0}
            treatment_types[t_type]['count'] += 1
            treatment_types[t_type]['avg_effectiveness'] += outcome.effectiveness_score or 0
        
        for t_type in treatment_types:
            treatment_types[t_type]['avg_effectiveness'] = round(
                treatment_types[t_type]['avg_effectiveness'] / treatment_types[t_type]['count'], 2
            )
        
        return {
            'total_outcomes': total_outcomes,
            'average_effectiveness': round(avg_effectiveness, 2),
            'success_rate': round(success_rate, 2),
            'department': department,
            'treatment_type_performance': treatment_types
        }
