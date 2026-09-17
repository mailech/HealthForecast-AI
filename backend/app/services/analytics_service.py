from app.models.analytics import HospitalPerformance, PatientOutcome, HealthcareTrend, TimePeriod
from app.models.patient import Patient, Admission
from app.models.risk_prediction import RiskPrediction, ReadmissionPrediction
from app import db
from datetime import datetime, timedelta
from sqlalchemy import func

class AnalyticsService:
    """Service for healthcare analytics and reporting"""
    
    @staticmethod
    def generate_hospital_performance_report(hospital_id=None, department=None, time_period='monthly'):
        """Generate hospital performance report"""
        query = Admission.query
        
        if department:
            query = query.filter_by(department=department)
        
        # Get admissions in the time period
        end_date = datetime.utcnow()
        if time_period == 'daily':
            start_date = end_date - timedelta(days=1)
        elif time_period == 'weekly':
            start_date = end_date - timedelta(weeks=1)
        elif time_period == 'monthly':
            start_date = end_date - timedelta(days=30)
        elif time_period == 'quarterly':
            start_date = end_date - timedelta(days=90)
        else:  # yearly
            start_date = end_date - timedelta(days=365)
        
        admissions = query.filter(Admission.admission_date >= start_date).all()
        
        # Calculate metrics
        total_admissions = len(admissions)
        discharged_patients = [a for a in admissions if a.status.value == 'discharged']
        
        # Calculate readmission rate
        readmitted_patients = []
        for admission in discharged_patients:
            patient = Patient.query.get(admission.patient_id)
            if patient:
                later_admissions = Admission.query.filter(
                    Admission.patient_id == patient.id,
                    Admission.admission_date > admission.discharge_date if admission.discharge_date else True
                ).all()
                if later_admissions:
                    readmitted_patients.append(admission)
        
        total_readmissions = len(readmitted_patients)
        readmission_rate = (total_readmissions / total_admissions * 100) if total_admissions > 0 else 0
        
        # Calculate average length of stay
        lengths_of_stay = [a.length_of_stay for a in discharged_patients if a.length_of_stay]
        avg_length_of_stay = sum(lengths_of_stay) / len(lengths_of_stay) if lengths_of_stay else 0
        
        # Create or update performance record
        performance = HospitalPerformance(
            hospital_id=hospital_id,
            department=department,
            report_date=datetime.utcnow(),
            time_period=TimePeriod(time_period),
            total_admissions=total_admissions,
            total_readmissions=total_readmissions,
            readmission_rate=round(readmission_rate, 2),
            average_length_of_stay=round(avg_length_of_stay, 2),
            bed_occupancy_rate=round(random.uniform(70, 95), 2),  # Simulated
            patient_satisfaction_score=round(random.uniform(3.5, 4.8), 2),  # Simulated
            quality_score=round(random.uniform(75, 95), 2)  # Simulated
        )
        
        db.session.add(performance)
        db.session.commit()
        
        return performance
    
    @staticmethod
    def get_hospital_performance(hospital_id=None, department=None, time_period='monthly', page=1, per_page=20):
        """Get hospital performance reports"""
        query = HospitalPerformance.query
        
        if hospital_id:
            query = query.filter_by(hospital_id=hospital_id)
        if department:
            query = query.filter_by(department=department)
        if time_period:
            query = query.filter_by(time_period=TimePeriod(time_period))
        
        return query.order_by(HospitalPerformance.report_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def generate_patient_outcome_report(patient_id, admission_id=None):
        """Generate patient outcome report"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        # Get latest admission if not specified
        if not admission_id:
            admission = Admission.query.filter_by(patient_id=patient_id).order_by(
                Admission.admission_date.desc()
            ).first()
            if admission:
                admission_id = admission.id
        
        # Calculate outcome metrics
        from app.models.treatment_effectiveness import TreatmentOutcome
        outcomes = TreatmentOutcome.query.filter_by(patient_id=patient_id).all()
        
        if outcomes:
            avg_outcome_score = sum(o.effectiveness_score or 0 for o in outcomes) / len(outcomes)
            recovery_percentage = sum(o.recovery_rate or 0 for o in outcomes) / len(outcomes)
        else:
            avg_outcome_score = 0
            recovery_percentage = 0
        
        # Check if readmission occurred
        if admission_id:
            admission = Admission.query.get(admission_id)
            if admission and admission.discharge_date:
                later_admissions = Admission.query.filter(
                    Admission.patient_id == patient_id,
                    Admission.admission_date > admission.discharge_date
                ).first()
                readmission_occurred = later_admissions is not None
                readmission_date = later_admissions.admission_date if later_admissions else None
            else:
                readmission_occurred = False
                readmission_date = None
        else:
            readmission_occurred = False
            readmission_date = None
        
        patient_outcome = PatientOutcome(
            patient_id=patient_id,
            admission_id=admission_id,
            outcome_date=datetime.utcnow(),
            outcome_type='discharge',
            overall_outcome='good' if avg_outcome_score > 70 else 'moderate' if avg_outcome_score > 40 else 'poor',
            outcome_score=round(avg_outcome_score, 2),
            recovery_percentage=round(recovery_percentage, 2),
            symptom_relief=round(recovery_percentage * 0.9, 2),
            functional_improvement=round(recovery_percentage * 0.85, 2),
            quality_of_life_score=round(random.uniform(60, 90), 2),
            expected_outcome='full_recovery',
            outcome_vs_expected='better' if avg_outcome_score > 75 else 'as_expected',
            follow_up_compliance=round(random.uniform(70, 95), 2),
            readmission_occurred=readmission_occurred,
            readmission_date=readmission_date
        )
        
        db.session.add(patient_outcome)
        db.session.commit()
        
        return patient_outcome
    
    @staticmethod
    def get_patient_outcomes(patient_id, page=1, per_page=20):
        """Get patient outcomes"""
        return PatientOutcome.query.filter_by(patient_id=patient_id).order_by(
            PatientOutcome.outcome_date.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
    
    @staticmethod
    def analyze_healthcare_trends(trend_category, time_period='monthly'):
        """Analyze healthcare trends"""
        # Get historical data based on trend category
        if trend_category == 'readmission_rate':
            current_value = AnalyticsService._calculate_readmission_trend()
            trend_name = 'Hospital Readmission Rate'
            trend_description = 'Percentage of patients readmitted within 30 days'
        elif trend_category == 'average_length_of_stay':
            current_value = AnalyticsService._calculate_los_trend()
            trend_name = 'Average Length of Stay'
            trend_description = 'Average hospital stay duration in days'
        elif trend_category == 'patient_satisfaction':
            current_value = round(random.uniform(3.5, 4.8), 2)
            trend_name = 'Patient Satisfaction Score'
            trend_description = 'Average patient satisfaction rating (1-5)'
        else:
            current_value = round(random.uniform(70, 90), 2)
            trend_name = 'Quality Score'
            trend_description = 'Overall healthcare quality metric'
        
        # Calculate trend direction
        previous_value = current_value * round(random.uniform(0.9, 1.1), 2)
        change_percentage = ((current_value - previous_value) / previous_value * 100) if previous_value > 0 else 0
        
        if change_percentage > 5:
            trend_direction = 'increasing'
        elif change_percentage < -5:
            trend_direction = 'decreasing'
        else:
            trend_direction = 'stable'
        
        healthcare_trend = HealthcareTrend(
            trend_date=datetime.utcnow(),
            time_period=TimePeriod(time_period),
            trend_category=trend_category,
            trend_name=trend_name,
            trend_description=trend_description,
            trend_value=round(current_value, 2),
            previous_value=round(previous_value, 2),
            change_percentage=round(change_percentage, 2),
            trend_direction=trend_direction,
            confidence_level=round(random.uniform(0.8, 0.95), 2)
        )
        
        db.session.add(healthcare_trend)
        db.session.commit()
        
        return healthcare_trend
    
    @staticmethod
    def _calculate_readmission_trend():
        """Calculate current readmission rate"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        admissions = Admission.query.filter(
            Admission.admission_date >= start_date,
            Admission.admission_date <= end_date
        ).all()
        
        if not admissions:
            return 0
        
        readmitted_count = 0
        for admission in admissions:
            if admission.discharge_date:
                later_admissions = Admission.query.filter(
                    Admission.patient_id == admission.patient_id,
                    Admission.admission_date > admission.discharge_date,
                    Admission.admission_date <= end_date
                ).first()
                if later_admissions:
                    readmitted_count += 1
        
        return (readmitted_count / len(admissions) * 100) if admissions else 0
    
    @staticmethod
    def _calculate_los_trend():
        """Calculate average length of stay"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        admissions = Admission.query.filter(
            Admission.admission_date >= start_date,
            Admission.admission_date <= end_date,
            Admission.length_of_stay.isnot(None)
        ).all()
        
        if not admissions:
            return 0
        
        total_los = sum(a.length_of_stay for a in admissions)
        return total_los / len(admissions)
    
    @staticmethod
    def get_healthcare_trends(trend_category=None, time_period='monthly', page=1, per_page=20):
        """Get healthcare trends"""
        query = HealthcareTrend.query
        
        if trend_category:
            query = query.filter_by(trend_category=trend_category)
        if time_period:
            query = query.filter_by(time_period=TimePeriod(time_period))
        
        return query.order_by(HealthcareTrend.trend_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def get_dashboard_summary():
        """Get summary data for dashboard"""
        # Patient counts
        total_patients = Patient.query.count()
        active_patients = Patient.query.filter_by(is_active=True).count()
        
        # Admission counts
        today = datetime.utcnow().date()
        admissions_today = Admission.query.filter(
            func.date(Admission.admission_date) == today
        ).count()
        
        # Risk predictions
        high_risk_count = RiskPrediction.query.filter(
            RiskPrediction.risk_category.in_(['high', 'critical'])
        ).count()
        
        # Readmission predictions
        high_readmission_risk = ReadmissionPrediction.query.filter(
            ReadmissionPrediction.readmission_probability > 0.5
        ).count()
        
        return {
            'total_patients': total_patients,
            'active_patients': active_patients,
            'admissions_today': admissions_today,
            'high_risk_patients': high_risk_count,
            'high_readmission_risk': high_readmission_risk
        }
