"""
HealthForecast AI - Comprehensive End-to-End System Test Suite
Tests all 4 roles, ML predictions, simulation, RBAC, analytics, and 3D endpoints.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health Check Passed:", res.json()["status"])

    print("\n--- 2. Testing Authentication for all 4 Roles ---")
    roles = [
        ("doctor@healthforecast.ai", "doctor123", "doctor"),
        ("admin@healthforecast.ai", "admin123", "hospital_admin"),
        ("researcher@healthforecast.ai", "research123", "healthcare_researcher"),
        ("sysadmin@healthforecast.ai", "sysadmin123", "system_admin")
    ]
    tokens = {}
    for email, pwd, expected_role in roles:
        res = client.post("/api/auth/login", json={"email": email, "password": pwd})
        assert res.status_code == 200, f"Login failed for {email}: {res.text}"
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == expected_role
        tokens[expected_role] = data["access_token"]
        print(f"[PASS] Login OK for {expected_role} ({data['user']['full_name']})")

    print("\n--- 3. Testing Patient Listing & AI Readmission Scoring ---")
    res = client.get("/api/patients")
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) >= 15, "Expected at least 15 seeded patients"
    sample = patients[0]
    print(f"[PASS] Patients Loaded: {len(patients)} patients")
    print(f"  Sample Patient: {sample['full_name']} | Risk: {sample['risk_score']}% ({sample['risk_category']})")
    assert "organ_risks" in sample, "Organ risks missing for 3D body twin"

    print("\n--- 4. Testing What-If Clinical Risk Simulation ---")
    sim_input = {
        "time_in_hospital": 8,
        "number_emergency": 3,
        "high_a1c": 1,
        "insulin_changed": 1,
        "num_medications": 22,
        "comorbidity_renal": 1,
        "comorbidity_circulatory": 1
    }
    res = client.post("/api/predict/simulate", json=sim_input)
    assert res.status_code == 200
    sim_res = res.json()
    print(f"[PASS] What-If Simulation Passed: Risk Score = {sim_res['readmission_risk_score']}%")
    print(f"  Risk Drivers Identified: {len(sim_res['risk_drivers'])}")
    print(f"  Organ Profile: Pancreas Severity = {sim_res['organ_risks']['pancreas']['risk_level']}")

    print("\n--- 5. Testing Hospital Administrator Analytics & 3D Smart Ward ---")
    res = client.get("/api/analytics/hospital-overview")
    assert res.status_code == 200
    ov = res.json()
    print(f"[PASS] Hospital Overview: Readmission Rate = {ov['readmission_rate_30d']}% (Avoided: {ov['avoidable_readmissions_prevented']})")

    res_beds = client.get("/api/analytics/ward-occupancy")
    assert res_beds.status_code == 200
    beds = res_beds.json()
    print(f"[PASS] 3D Smart Ward Beds: {len(beds)} 3D bed units mapped")

    print("\n--- 6. Testing Healthcare Researcher Anonymization & 3D Cohort Manifold ---")
    # Call patients with researcher token
    res_anon = client.get("/api/patients", headers={"Authorization": f"Bearer {tokens['healthcare_researcher']}"})
    assert res_anon.status_code == 200
    anon_sample = res_anon.json()[0]
    assert "Subject-" in anon_sample["full_name"], "PII was not properly anonymized!"
    print(f"[PASS] HIPAA De-Identification Verified: {anon_sample['full_name']} (Real name scrubbed)")

    res_cohort = client.get("/api/research/cohort-data")
    assert res_cohort.status_code == 200
    cohort = res_cohort.json()
    print(f"[PASS] 3D Cohort Constellation Points: {len(cohort)} 3D points loaded")

    print("\n--- 7. Testing AI Model Management & Benchmarking ---")
    res_metrics = client.get("/api/models/metrics")
    assert res_metrics.status_code == 200
    metrics = res_metrics.json()
    print(f"[PASS] Model Benchmark: Accuracy = {metrics['accuracy']}%, ROC-AUC = {metrics['roc_auc']}")
    print(f"  Top Predictive Feature: {metrics['feature_importances'][0]['readable_name']} ({metrics['feature_importances'][0]['importance']})")

    print("\n=======================================================")
    print(" ALL END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
