"""
Diabetes 130-US Hospitals Dataset Integration
This script handles loading, cleaning, and preprocessing the dataset
"""

import os
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.patient import Patient
from app.models.admission import Admission
from app.models.medical_history import MedicalHistory
from app.models.treatment import Treatment
from datetime import datetime, date, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DiabetesDatasetIntegration:
    def __init__(self, dataset_path: str = None, db: Session = None):
        self.dataset_path = dataset_path
        self.db = db if db is not None else SessionLocal()
        self._own_db = db is None
    
    def load_dataset(self):
        """Load the Diabetes 130-US Hospitals dataset"""
        try:
            logger.info("Loading Diabetes 130-US Hospitals dataset...")
            
            column_names = [
                'encounter_id', 'patient_nbr', 'race', 'gender', 'age',
                'weight', 'admission_type_id', 'discharge_disposition_id',
                'admission_source_id', 'time_in_hospital', 'payer_code',
                'medical_specialty', 'num_lab_procedures', 'num_procedures',
                'num_medications', 'number_outpatient', 'number_emergency',
                'number_inpatient', 'diag_1', 'diag_2', 'diag_3',
                'number_diagnoses', 'max_glu_serum', 'A1Cresult',
                'change', 'diabetesMed', 'readmitted'
            ]
            
            if self.dataset_path and isinstance(self.dataset_path, str) and self.dataset_path.strip() and os.path.exists(self.dataset_path) and os.path.isfile(self.dataset_path):
                try:
                    first_line = pd.read_csv(self.dataset_path, nrows=1)
                    if 'encounter_id' in first_line.columns or 'patient_nbr' in first_line.columns or 'patient_id' in first_line.columns:
                        df = pd.read_csv(self.dataset_path)
                    else:
                        df = pd.read_csv(self.dataset_path, names=column_names)
                except Exception:
                    df = pd.read_csv(self.dataset_path, names=column_names)
            else:
                df = self.create_sample_data()
            
            logger.info(f"Dataset loaded with {len(df)} records")
            return df
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            raise
    
    def create_sample_data(self):
        """Create sample data for demonstration purposes"""
        data = {
            'encounter_id': range(101, 201),
            'patient_nbr': [f'PAT{i:03d}' for i in range(101, 201)],
            'race': np.random.choice(['Caucasian', 'AfricanAmerican', 'Hispanic', 'Asian', 'Other'], 100),
            'gender': np.random.choice(['Male', 'Female'], 100),
            'age': np.random.choice(['[0-10)', '[10-20)', '[20-30)', '[30-40)', '[40-50)', '[50-60)', '[60-70)', '[70-80)', '[80-90)', '[90-100)'], 100),
            'weight': np.random.choice(['[0-25)', '[25-50)', '[50-75)', '[75-100)', '[100-125)', '[125-150)', '[150-175)', '[175-200)', '>200'], 100),
            'admission_type_id': np.random.randint(1, 9, 100),
            'discharge_disposition_id': np.random.randint(1, 29, 100),
            'admission_source_id': np.random.randint(1, 26, 100),
            'time_in_hospital': np.random.randint(1, 15, 100),
            'payer_code': np.random.choice(['MC', 'MD', 'HM', 'SP', 'BC', 'CP', 'UN', 'OG', 'None'], 100),
            'medical_specialty': np.random.choice(['Cardiology', 'InternalMedicine', 'Family/GeneralPractice', 'Surgery', 'Emergency/Trauma'], 100),
            'num_lab_procedures': np.random.randint(1, 100, 100),
            'num_procedures': np.random.randint(0, 10, 100),
            'num_medications': np.random.randint(1, 50, 100),
            'number_outpatient': np.random.randint(0, 20, 100),
            'number_emergency': np.random.randint(0, 15, 100),
            'number_inpatient': np.random.randint(0, 10, 100),
            'diag_1': np.random.choice(['250', '401', '428', '486', '491', '584', '786'], 100),
            'diag_2': np.random.choice(['250', '401', '428', '486', '491', '584', '786', 'None'], 100),
            'diag_3': np.random.choice(['250', '401', '428', '486', '491', '584', '786', 'None'], 100),
            'number_diagnoses': np.random.randint(1, 16, 100),
            'max_glu_serum': np.random.choice(['None', '>200', '>300', 'Norm'], 100),
            'A1Cresult': np.random.choice(['None', '>7', '>8', 'Norm'], 100),
            'change': np.random.choice(['No', 'Ch'], 100),
            'diabetesMed': np.random.choice(['No', 'Yes'], 100),
            'readmitted': np.random.choice(['NO', '<30', '>30'], 100)
        }
        return pd.DataFrame(data)
    
    def clean_data(self, df):
        """Clean and preprocess the dataset"""
        logger.info("Cleaning dataset...")
        
        # Replace '?' and other missing value indicators
        df.replace('?', np.nan, inplace=True)
        df.replace('None', np.nan, inplace=True)
        
        # Handle missing values
        # For categorical variables, fill with mode
        categorical_cols = ['race', 'gender', 'payer_code', 'medical_specialty', 'max_glu_serum', 'A1Cresult']
        for col in categorical_cols:
            if col in df.columns:
                mode_val = df[col].mode()[0] if not df[col].mode().empty else 'Unknown'
                df[col] = df[col].fillna(mode_val)
        
        # For numeric variables, fill with median
        numeric_cols = ['time_in_hospital', 'num_lab_procedures', 'num_procedures', 'num_medications']
        for col in numeric_cols:
            if col in df.columns:
                median_val = df[col].median()
                df[col] = df[col].fillna(median_val)
        
        # Convert age ranges to numeric (midpoint)
        age_mapping = {
            '[0-10)': 5, '[10-20)': 15, '[20-30)': 25, '[30-40)': 35,
            '[40-50)': 45, '[50-60)': 55, '[60-70)': 65, '[70-80)': 75,
            '[80-90)': 85, '[90-100)': 95
        }
        if 'age' in df.columns:
            df['age_numeric'] = df['age'].map(age_mapping)
        
        # Convert readmitted to binary flag
        if 'readmitted' in df.columns:
            df['readmission_flag'] = df['readmitted'].apply(lambda x: 'Yes' if x == '<30' else 'No')
        elif 'readmission_flag' not in df.columns:
            df['readmission_flag'] = 'No'
        
        logger.info("Data cleaning completed")
        return df
    
    def transform_to_db_format(self, df):
        """Transform dataset to match database schema"""
        logger.info("Transforming data to database format...")
        
        patients_data = []
        admissions_data = []
        medical_history_data = []
        treatments_data = []
        
        existing_patient_ids = {p.patient_id for p in self.db.query(Patient).all()}
        seen_patient_ids = set(existing_patient_ids)
        
        for _, row in df.iterrows():
            patient_id_raw = row.get('patient_nbr', row.get('patient_id', ''))
            pid_str = str(patient_id_raw)
            if not pid_str or pid_str == 'nan':
                continue
            
            if pid_str not in seen_patient_ids:
                seen_patient_ids.add(pid_str)
                age = row.get('age_numeric', 50)
                if pd.isna(age):
                    age = 50
                birth_year = datetime.now().year - int(age)
                dob = date(birth_year, 1, 1)
                
                pid_suffix = pid_str.split("_")[1] if "_" in pid_str else pid_str
                patients_data.append({
                    'patient_id': pid_str,
                    'first_name': f'Patient_{pid_suffix}',
                    'last_name': 'Dataset',
                    'date_of_birth': dob,
                    'gender': str(row.get('gender', 'Unknown')),
                    'is_active': True
                })
            
            days_back = int(np.random.randint(1, 365))
            time_in_hosp = int(row.get('time_in_hospital', 1)) if not pd.isna(row.get('time_in_hospital')) else 1
            
            now_dt = datetime.now()
            admission_dt = now_dt - timedelta(days=days_back)
            discharge_dt = admission_dt + timedelta(days=time_in_hosp)
            
            encounter_id = row.get('encounter_id', np.random.randint(10000, 99999))
            adm_num = f'ADM_{encounter_id}'
            
            admissions_data.append({
                'patient_id': pid_str,
                'admission_number': adm_num,
                'admission_date': admission_dt.date(),
                'discharge_date': discharge_dt.date(),
                'admission_type': self.get_admission_type(row.get('admission_type_id', 1)),
                'department': str(row.get('medical_specialty', 'InternalMedicine')),
                'diagnosis': self.get_diagnosis_description(row.get('diag_1', '250')),
                'length_of_stay': time_in_hosp,
                'readmission_flag': str(row.get('readmission_flag', 'No')),
                'readmission_reason': 'Diabetes-related readmission' if str(row.get('readmission_flag')) == 'Yes' else None
            })
            
            medical_history_data.append({
                'patient_id': pid_str,
                'condition': 'Type 2 Diabetes',
                'diagnosis_date': admission_dt,
                'status': 'Active',
                'notes': f'A1C: {row.get("A1Cresult", "None")}, Max Glucose: {row.get("max_glu_serum", "None")}'
            })
            
            if str(row.get('diabetesMed')) == 'Yes':
                treatments_data.append({
                    'patient_id': pid_str,
                    'admission_number': adm_num,
                    'treatment_name': 'Diabetes Medication',
                    'treatment_type': 'Medication',
                    'start_date': admission_dt,
                    'end_date': discharge_dt,
                    'prescribed_by': 'Dataset Import',
                    'outcome': 'Ongoing' if str(row.get('change')) == 'Ch' else 'Completed'
                })
        
        logger.info(f"Transformed {len(patients_data)} patients, {len(admissions_data)} admissions")
        return patients_data, admissions_data, medical_history_data, treatments_data
    
    def get_admission_type(self, type_id):
        """Map admission type ID to description"""
        mapping = {
            1: 'Emergency',
            2: 'Urgent',
            3: 'Elective',
            4: 'Newborn',
            5: 'Not Available',
            6: 'NULL',
            7: 'Trauma Center',
            8: 'Not Mapped'
        }
        try:
            return mapping.get(int(type_id), 'Unknown')
        except Exception:
            return 'Unknown'
    
    def get_diagnosis_description(self, diag_code):
        """Map ICD-9 diagnosis code to description"""
        mapping = {
            '250': 'Diabetes Mellitus',
            '401': 'Essential Hypertension',
            '428': 'Heart Failure',
            '486': 'Pneumonia',
            '491': 'Chronic Bronchitis',
            '584': 'Acute Kidney Failure',
            '786': 'Symptoms involving respiratory system'
        }
        return mapping.get(str(diag_code)[:3], 'Other diagnosis')
    
    def save_to_database(self, patients_data, admissions_data, medical_history_data, treatments_data):
        """Save transformed data to database"""
        logger.info("Saving data to database...")
        
        try:
            # 1. Save patients
            for patient_data in patients_data:
                existing = self.db.query(Patient).filter(
                    Patient.patient_id == patient_data['patient_id']
                ).first()
                if not existing:
                    patient = Patient(**patient_data)
                    self.db.add(patient)
            self.db.flush()
            
            patient_map = {p.patient_id: p.id for p in self.db.query(Patient).all()}
            
            # 2. Save admissions
            for admission_data in admissions_data:
                pid_str = admission_data['patient_id']
                if pid_str in patient_map:
                    admission_data['patient_id'] = patient_map[pid_str]
                    existing = self.db.query(Admission).filter(
                        Admission.admission_number == admission_data['admission_number']
                    ).first()
                    if not existing:
                        admission = Admission(**admission_data)
                        self.db.add(admission)
            self.db.flush()
            
            admission_map = {a.admission_number: a.id for a in self.db.query(Admission).all()}
            
            # 3. Save medical history
            for history_data in medical_history_data:
                pid_str = history_data['patient_id']
                if pid_str in patient_map:
                    history_data['patient_id'] = patient_map[pid_str]
                    history = MedicalHistory(**history_data)
                    self.db.add(history)
            
            # 4. Save treatments
            for treatment_data in treatments_data:
                pid_str = treatment_data['patient_id']
                adm_num = treatment_data.pop('admission_number', None)
                if pid_str in patient_map:
                    treatment_data['patient_id'] = patient_map[pid_str]
                    if adm_num and adm_num in admission_map:
                        treatment_data['admission_id'] = admission_map[adm_num]
                    treatment = Treatment(**treatment_data)
                    self.db.add(treatment)
            
            self.db.commit()
            logger.info("Data successfully saved to database")
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error saving to database: {e}")
            raise
        finally:
            if self._own_db:
                self.db.close()
    
    def run_integration(self, dataset_path: str = None):
        """Run the complete integration process"""
        if dataset_path:
            self.dataset_path = dataset_path
        
        try:
            df = self.load_dataset()
            df_cleaned = self.clean_data(df)
            patients, admissions, history, treatments = self.transform_to_db_format(df_cleaned)
            self.save_to_database(patients, admissions, history, treatments)
            
            logger.info("Dataset integration completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Integration failed: {e}")
            return False


if __name__ == "__main__":
    integrator = DiabetesDatasetIntegration()
    success = integrator.run_integration()
    if success:
        print("Dataset integration completed successfully!")
    else:
        print("Dataset integration failed!")
