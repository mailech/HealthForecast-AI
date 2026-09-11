import os
import pandas as pd
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models.patient import Patient
from app.models.encounter import Encounter
from app.crud.crud_patient import get_patient_by_nbr, create_patient
from app.crud.crud_encounter import get_encounter_by_encounter_id
from app.schemas.patient import PatientCreate
from app.core.config import settings

async def seed_dataset_from_csv(db: AsyncSession, max_rows: int = 2000) -> Dict[str, Any]:
    csv_path = settings.DATASET_PATH
    if not os.path.exists(csv_path):
        return {"status": "error", "message": f"Dataset file not found at {csv_path}"}

    # Check existing encounter count
    count_result = await db.execute(select(func.count(Encounter.id)))
    existing_count = count_result.scalar_one()
    if existing_count > 0:
        return {
            "status": "already_seeded",
            "message": f"Database already contains {existing_count} encounter records.",
            "encounter_count": existing_count
        }

    # Load dataset with pandas
    df = pd.read_csv(csv_path, nrows=max_rows)
    
    patients_created = 0
    encounters_created = 0
    patient_map = {} # patient_nbr -> Patient DB ID

    for _, row in df.iterrows():
        nbr = str(row['patient_nbr'])
        enc_id = str(row['encounter_id'])
        
        if nbr not in patient_map:
            db_patient = await get_patient_by_nbr(db, nbr)
            if not db_patient:
                patient_in = PatientCreate(
                    patient_nbr=nbr,
                    gender=str(row.get('gender', 'Unknown/Invalid')),
                    age_group=str(row.get('age', '[50-60)')),
                    race=str(row.get('race', 'Caucasian')),
                    weight_group=str(row.get('weight', '?'))
                )
                db_patient = await create_patient(db, patient_in)
                patients_created += 1
            patient_map[nbr] = db_patient.id

        patient_db_id = patient_map[nbr]
        
        # Check if encounter exists
        existing_enc = await get_encounter_by_encounter_id(db, enc_id)
        if not existing_enc:
            enc = Encounter(
                encounter_id=enc_id,
                patient_id=patient_db_id,
                admission_type_id=int(row['admission_type_id']) if pd.notnull(row['admission_type_id']) else 1,
                discharge_disposition_id=int(row['discharge_disposition_id']) if pd.notnull(row['discharge_disposition_id']) else 1,
                admission_source_id=int(row['admission_source_id']) if pd.notnull(row['admission_source_id']) else 7,
                time_in_hospital=int(row.get('time_in_hospital', 1)),
                payer_code=str(row.get('payer_code', '?')),
                medical_specialty=str(row.get('medical_specialty', '?')),
                num_lab_procedures=int(row.get('num_lab_procedures', 0)),
                num_procedures=int(row.get('num_procedures', 0)),
                num_medications=int(row.get('num_medications', 0)),
                number_outpatient=int(row.get('number_outpatient', 0)),
                number_emergency=int(row.get('number_emergency', 0)),
                number_inpatient=int(row.get('number_inpatient', 0)),
                diag_1=str(row.get('diag_1', '?')),
                diag_2=str(row.get('diag_2', '?')),
                diag_3=str(row.get('diag_3', '?')),
                number_diagnoses=int(row.get('number_diagnoses', 0)),
                max_glu_serum=str(row.get('max_glu_serum', 'None')),
                a1c_result=str(row.get('A1Cresult', 'None')),
                metformin=str(row.get('metformin', 'No')),
                repaglinide=str(row.get('repaglinide', 'No')),
                nateglinide=str(row.get('nateglinide', 'No')),
                chlorpropamide=str(row.get('chlorpropamide', 'No')),
                glimepiride=str(row.get('glimepiride', 'No')),
                acetohexamide=str(row.get('acetohexamide', 'No')),
                glipizide=str(row.get('glipizide', 'No')),
                glyburide=str(row.get('glyburide', 'No')),
                tolbutamide=str(row.get('tolbutamide', 'No')),
                pioglitazone=str(row.get('pioglitazone', 'No')),
                rosiglitazone=str(row.get('rosiglitazone', 'No')),
                acarbose=str(row.get('acarbose', 'No')),
                miglitol=str(row.get('miglitol', 'No')),
                troglitazone=str(row.get('troglitazone', 'No')),
                tolazamide=str(row.get('tolazamide', 'No')),
                examide=str(row.get('examide', 'No')),
                citoglipton=str(row.get('citoglipton', 'No')),
                insulin=str(row.get('insulin', 'No')),
                glyburide_metformin=str(row.get('glyburide-metformin', 'No')),
                glipizide_metformin=str(row.get('glipizide-metformin', 'No')),
                glimepiride_pioglitazone=str(row.get('glimepiride-pioglitazone', 'No')),
                metformin_rosiglitazone=str(row.get('metformin-rosiglitazone', 'No')),
                metformin_pioglitazone=str(row.get('metformin-pioglitazone', 'No')),
                change_status=str(row.get('change', 'No')),
                diabetes_med=str(row.get('diabetesMed', 'No')),
                actual_readmitted=str(row.get('readmitted', 'NO'))
            )
            db.add(enc)
            encounters_created += 1
            
    await db.commit()
    return {
        "status": "success",
        "message": f"Successfully ingested dataset records.",
        "patients_created": patients_created,
        "encounters_created": encounters_created
    }
