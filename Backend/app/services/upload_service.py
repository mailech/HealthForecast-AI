import csv
import io
from datetime import datetime
from typing import List, Tuple, Optional
from app.database import patients_collection, medical_histories_collection
from app.schemas.patient import PatientCreate
from app.schemas.history import MedicalHistoryCreate

class UploadService:
    @staticmethod
    def validate_and_import_csv(csv_content: str) -> Tuple[bool, List[str], int]:
        """
        Parses CSV data, validates each row against Patient and Medical History schemas,
        and imports them into the MongoDB collections.
        Returns:
            (success: bool, errors: list of strings, count_inserted: int)
        """
        f = io.StringIO(csv_content)
        reader = csv.DictReader(f)
        
        # Define required headers for our intelligence system
        required_headers = {
            "patient_id", "first_name", "last_name", "date_of_birth", "gender",
            "hospital", "admission_date", "discharge_date", "primary_diagnosis",
            "length_of_stay", "num_previous_admissions", "num_medications",
            "systolic_bp", "diastolic_bp", "blood_sugar"
        }
        
        if not reader.fieldnames:
            return False, ["Uploaded CSV is empty or has invalid format."], 0
            
        missing_headers = required_headers - set(reader.fieldnames)
        if missing_headers:
            return False, [f"Missing required CSV columns: {list(missing_headers)}"], 0
            
        errors = []
        rows_to_insert = []
        
        for idx, row in enumerate(reader, start=1):
            row_errors = []
            
            cleaned_row = {k: (v.strip() if v else "") for k, v in row.items()}
            
            # Extract Patient fields
            patient_data = {
                "patient_id": cleaned_row.get("patient_id"),
                "first_name": cleaned_row.get("first_name"),
                "last_name": cleaned_row.get("last_name"),
                "date_of_birth": cleaned_row.get("date_of_birth"),
                "gender": cleaned_row.get("gender"),
                "email": cleaned_row.get("email") or None,
                "phone": cleaned_row.get("phone") or None,
                "hospital": cleaned_row.get("hospital")
            }
            
            try:
                PatientCreate(**patient_data)
            except Exception as e:
                row_errors.append(f"Patient details invalid: {e}")
                
            # Parse comorbidities
            comorb_str = cleaned_row.get("comorbidities", "")
            comorbidities = [c.strip() for c in comorb_str.split(",") if c.strip()] if comorb_str else []
            
            # Safe type parsing helpers
            def parse_int(val: str, field: str) -> int:
                try:
                    return int(val)
                except ValueError:
                    row_errors.append(f"Field '{field}' must be integer (got '{val}')")
                    return 0
                    
            def parse_float(val: str, field: str) -> float:
                try:
                    return float(val)
                except ValueError:
                    row_errors.append(f"Field '{field}' must be numeric (got '{val}')")
                    return 0.0
                    
            def parse_datetime(val: str, field: str) -> datetime:
                for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
                    try:
                        return datetime.strptime(val, fmt)
                    except ValueError:
                        continue
                row_errors.append(f"Invalid date format for '{field}': '{val}' (expected YYYY-MM-DD)")
                return datetime.utcnow()
                
            history_data = {
                "patient_id": cleaned_row.get("patient_id"),
                "admission_date": parse_datetime(cleaned_row.get("admission_date"), "admission_date"),
                "discharge_date": parse_datetime(cleaned_row.get("discharge_date"), "discharge_date"),
                "primary_diagnosis": cleaned_row.get("primary_diagnosis"),
                "comorbidities": comorbidities,
                "length_of_stay": parse_int(cleaned_row.get("length_of_stay"), "length_of_stay"),
                "num_previous_admissions": parse_int(cleaned_row.get("num_previous_admissions"), "num_previous_admissions"),
                "num_medications": parse_int(cleaned_row.get("num_medications"), "num_medications"),
                "systolic_bp": parse_int(cleaned_row.get("systolic_bp"), "systolic_bp"),
                "diastolic_bp": parse_int(cleaned_row.get("diastolic_bp"), "diastolic_bp"),
                "blood_sugar": parse_float(cleaned_row.get("blood_sugar"), "blood_sugar"),
                "notes": cleaned_row.get("notes") or None
            }
            
            try:
                MedicalHistoryCreate(**history_data)
            except Exception as e:
                row_errors.append(f"Medical history invalid: {e}")
                
            if row_errors:
                errors.append(f"Row {idx}: " + " | ".join(row_errors))
            else:
                rows_to_insert.append((patient_data, history_data))
                
        if errors:
            # Fail fast: do not insert any records if validation errors exist
            return False, errors[:30], 0
            
        inserted_count = 0
        for pat_data, hist_data in rows_to_insert:
            pid = pat_data["patient_id"]
            existing = patients_collection.find_one({"patient_id": pid})
            
            if not existing:
                pat_data["created_at"] = datetime.utcnow()
                pat_data["updated_at"] = datetime.utcnow()
                patients_collection.insert_one(pat_data)
            else:
                # Update tracking details
                patients_collection.update_one(
                    {"patient_id": pid},
                    {"$set": {"updated_at": datetime.utcnow()}}
                )
                
            hist_data["created_at"] = datetime.utcnow()
            medical_histories_collection.insert_one(hist_data)
            inserted_count += 1
            
        return True, [], inserted_count
