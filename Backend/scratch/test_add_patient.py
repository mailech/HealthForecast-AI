import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, patients_collection, users_collection
from app.schemas.patient import PatientCreate
from app.services.patient_service import PatientService
from app.utils.security import create_access_token
import httpx

init_db()

print("Checking patients count:", patients_collection.count_documents({}))

# Try creating a patient using PatientService
new_p = PatientCreate(
    patient_id="PAT-TEST-9999",
    first_name="Test",
    last_name="Patient",
    date_of_birth="1990-01-01",
    gender="Male",
    email="testpatient9999@email.com",
    phone="1234567890",
    hospital="General Hospital"
)

res = PatientService.create_patient(new_p)
print("PatientService result:", res)

# Clean up test patient
if res:
    patients_collection.delete_one({"patient_id": "PAT-TEST-9999"})
    print("Deleted test patient.")
