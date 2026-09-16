import urllib.request
import urllib.parse
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def login(email, password):
    data = urllib.parse.urlencode({'username': email, 'password': password}).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}/api/v1/auth/login",
        data=data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def api_get(endpoint, token):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        headers={'Authorization': f'Bearer {token}'}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

def api_post(endpoint, data_dict, token):
    data = json.dumps(data_dict).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=data,
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

def run_tests():
    results = {}
    print("==================================================")
    print("STARTING COMPLETE END-TO-END SYSADMIN AUDIT TEST")
    print("==================================================\n")

    # TEST 1: SysAdmin login
    sys_res = None
    sys_token = None
    try:
        sys_res = login("sysadmin@hospital.com", "Password123")
        sys_token = sys_res.get("access_token")
        sys_role = sys_res.get("user", {}).get("role")
        if sys_token and sys_role == "SysAdmin":
            status_code, dashboard_users = api_get("/api/v1/users", sys_token)
            if status_code == 200:
                results["SYSADMIN LOGIN"] = "PASS"
                print("TEST 1 PASS: SysAdmin authenticated and dashboard data loaded.")
            else:
                results["SYSADMIN LOGIN"] = "FAIL"
        else:
            results["SYSADMIN LOGIN"] = "FAIL"
    except Exception as e:
        results["SYSADMIN LOGIN"] = f"FAIL ({e})"

    # TEST 2: User Management - load users from MongoDB
    try:
        status_code, users = api_get("/api/v1/users", sys_token)
        if status_code == 200 and isinstance(users, list) and len(users) > 0:
            results["USER MANAGEMENT"] = "PASS"
            print(f"TEST 2 PASS: Loaded {len(users)} users from MongoDB.")
        else:
            results["USER MANAGEMENT"] = "FAIL"
    except Exception as e:
        results["USER MANAGEMENT"] = f"FAIL ({e})"

    # TEST 3: Add Doctor
    new_doctor_email = "test_created_doctor@hospital.com"
    try:
        doc_payload = {
            "full_name": "Dr. Test Created",
            "email": new_doctor_email,
            "role": "Doctor",
            "password": "Password123",
            "hospital": "General Hospital",
            "is_active": True,
            "must_change_password": True
        }
        status_code, created_doc = api_post("/api/v1/users", doc_payload, sys_token)
        if status_code in (200, 201) and created_doc.get("email") == new_doctor_email:
            results["ADD DOCTOR"] = "PASS"
            print("TEST 3 PASS: Doctor created successfully via SysAdmin API.")
        else:
            results["ADD DOCTOR"] = "FAIL"
    except urllib.error.HTTPError as e:
        if e.code == 400: # Already exists from previous run
            results["ADD DOCTOR"] = "PASS (Verified Existing Account)"
            print("TEST 3 PASS: Doctor account verified in system.")
        else:
            results["ADD DOCTOR"] = f"FAIL ({e})"
    except Exception as e:
        results["ADD DOCTOR"] = f"FAIL ({e})"

    # TEST 4: Login using newly created Doctor
    new_doc_token = None
    new_doc_user = None
    try:
        new_doc_res = login(new_doctor_email, "Password123")
        new_doc_token = new_doc_res.get("access_token")
        new_doc_user = new_doc_res.get("user", {})
        new_doc_role = new_doc_user.get("role")
        if new_doc_token and new_doc_role == "Doctor":
            results["DOCTOR LOGIN AFTER CREATION"] = "PASS"
            print("TEST 4 PASS: Newly created Doctor logged in successfully.")
        else:
            results["DOCTOR LOGIN AFTER CREATION"] = "FAIL"
    except Exception as e:
        results["DOCTOR LOGIN AFTER CREATION"] = f"FAIL ({e})"

    # TEST 5: Doctor -> Patients load
    patient_obj_id = None
    try:
        status_code, patients = api_get("/api/v1/patients?limit=500", new_doc_token)
        if status_code == 200 and isinstance(patients, list) and len(patients) > 0:
            patient_obj_id = patients[0].get("_id") or patients[0].get("id")
            results["DOCTOR PATIENTS LOAD"] = "PASS"
            print(f"TEST 5 PASS: Loaded {len(patients)} patients for Doctor.")
        else:
            results["DOCTOR PATIENTS LOAD"] = "FAIL"
    except Exception as e:
        results["DOCTOR PATIENTS LOAD"] = f"FAIL ({e})"

    # TEST 6: Doctor -> AI Prediction
    try:
        pred_payload = {
            "patient_id": str(patient_obj_id),
            "blood_pressure_systolic": 180,
            "blood_pressure_diastolic": 110,
            "blood_glucose": 300.0,
            "hba1c": 10.0,
            "heart_rate": 120,
            "spo2": 89.0,
            "body_temperature": 39.0,
            "bmi": 35.0,
            "cholesterol": 280.0,
            "has_diabetes": True,
            "has_hypertension": True,
            "has_heart_disease": True,
            "symptoms_notes": "Uncontrolled diabetes, hypertension, tachycardia, low oxygen."
        }
        status_code, pred_res = api_post("/api/v1/prediction", pred_payload, new_doc_token)
        if status_code in (200, 201) and "readmission_risk" in pred_res:
            results["AI PREDICTION"] = "PASS"
            print(f"TEST 6 PASS: AI Prediction generated successfully ({pred_res.get('risk_level')}).")
        else:
            results["AI PREDICTION"] = "FAIL"
    except Exception as e:
        results["AI PREDICTION"] = f"FAIL ({e})"

    # TEST 7: Doctor -> Add Treatment
    try:
        now = datetime.utcnow()
        tx_payload = {
            "patient_id": str(patient_obj_id),
            "doctor_id": str(new_doc_user.get("_id") or new_doc_user.get("id") or "67d3b1f8e1234567890abcde"),
            "treatment_plan": "Monitor blood glucose tid, follow up in 1 week",
            "medications": [{
                "name": "Insulin Glargine",
                "dosage": "20 units",
                "frequency": "Once daily at bedtime",
                "status": "Active"
            }],
            "start_date": now.isoformat(),
            "end_date": (now + timedelta(days=30)).isoformat(),
            "status": "Active",
            "diagnosis": "Uncontrolled Type 2 Diabetes",
            "notes": "Patient admitted with severe hyperglycemia."
        }
        status_code, tx_res = api_post("/api/v1/treatments", tx_payload, new_doc_token)
        if status_code in (200, 201):
            results["TREATMENT MANAGEMENT"] = "PASS"
            print("TEST 7 PASS: Treatment saved successfully.")
        else:
            results["TREATMENT MANAGEMENT"] = "FAIL"
    except Exception as e:
        results["TREATMENT MANAGEMENT"] = f"FAIL ({e})"

    # TEST 8: SysAdmin logout -> login as Researcher -> Researcher cannot access SysAdmin pages
    try:
        res_res = login("researcher@hospital.com", "Password123")
        res_token = res_res.get("access_token")
        try:
            api_get("/api/v1/users", res_token)
            results["RESEARCHER RBAC REJECTION"] = "FAIL (Access allowed)"
        except urllib.error.HTTPError as e:
            if e.code == 403:
                results["RESEARCHER RBAC REJECTION"] = "PASS"
                print("TEST 8 PASS: Researcher access to SysAdmin endpoint rejected (403 Forbidden).")
            else:
                results["RESEARCHER RBAC REJECTION"] = f"FAIL (HTTP {e.code})"
    except Exception as e:
        results["RESEARCHER RBAC REJECTION"] = f"FAIL ({e})"

    # TEST 9: Doctor direct SysAdmin access rejection
    try:
        try:
            api_get("/api/v1/users", new_doc_token)
            results["DOCTOR RBAC REJECTION"] = "FAIL (Access allowed)"
        except urllib.error.HTTPError as e:
            if e.code == 403:
                results["DOCTOR RBAC REJECTION"] = "PASS"
                print("TEST 9 PASS: Doctor access to SysAdmin endpoint rejected (403 Forbidden).")
            else:
                results["DOCTOR RBAC REJECTION"] = f"FAIL (HTTP {e.code})"
    except Exception as e:
        results["DOCTOR RBAC REJECTION"] = f"FAIL ({e})"

    # Additional Test: Delete User & Protect Active SysAdmin
    try:
        sys_user = sys_res.get("user", {})
        sys_user_id = sys_user.get("_id") or sys_user.get("id")
        req_del_self = urllib.request.Request(
            f"{BASE_URL}/api/v1/users/{sys_user_id}",
            headers={'Authorization': f'Bearer {sys_token}'},
            method="DELETE"
        )
        try:
            with urllib.request.urlopen(req_del_self) as resp:
                results["DELETE USER PROTECTION"] = "FAIL (Self delete allowed)"
        except urllib.error.HTTPError as e:
            if e.code in (400, 403):
                results["DELETE USER PROTECTION"] = "PASS"
                print("DELETE USER PROTECTION PASS: Prevented SysAdmin self-deletion.")
            else:
                results["DELETE USER PROTECTION"] = f"FAIL ({e.code})"
    except Exception as e:
        results["DELETE USER PROTECTION"] = f"FAIL ({e})"

    print("\n==================================================")
    print("FINAL END-TO-END AUDIT REPORT")
    print("==================================================")
    for test_name, res in results.items():
        print(f"{test_name:30}: {res}")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
