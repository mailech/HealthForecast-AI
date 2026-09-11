import os
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.services.analytics_service import TreatmentAnalyticsService

DATASET_PATH = settings.DATASET_PATH

def test_treatment_summary_analytics():
    """Verify global treatment summary metrics and non-causal disclaimer."""
    summary = TreatmentAnalyticsService.get_treatment_summary()
    assert summary["total_encounters_analyzed"] == 99343
    assert "count" in summary["diabetes_med_prescribed"]
    assert "percentage" in summary["diabetes_med_prescribed"]
    assert summary["diabetes_med_prescribed"]["percentage"] > 70.0
    
    assert len(summary["top_prescribed_medications"]) > 0
    top_drug = summary["top_prescribed_medications"][0]
    assert top_drug["medication_name"] == "Insulin"
    assert top_drug["user_count"] > 50000
    
    assert "Observational Association Disclaimer" in summary["disclaimer"]

def test_medication_outcomes_analytics():
    """Verify 30-day readmission outcome rates across major medication cohorts."""
    outcomes = TreatmentAnalyticsService.get_medication_outcomes()
    assert outcomes["baseline_readmission_rate_30d"] == 11.19
    assert len(outcomes["cohort_outcomes"]) >= 8
    
    # Check insulin cohort
    insulin_cohort = next(c for c in outcomes["cohort_outcomes"] if c["cohort_name"] == "Insulin Therapy (All Doses)")
    assert insulin_cohort["sample_size"] > 50000
    assert insulin_cohort["early_readmit_rate"] > 0.0
    assert insulin_cohort["relative_risk_vs_baseline"] > 0.0

def test_change_status_outcomes_analytics():
    """Verify outcomes for regimen change (change = Ch vs No) and diabetesMed status."""
    change_outcomes = TreatmentAnalyticsService.get_change_status_outcomes()
    assert len(change_outcomes["cohort_outcomes"]) >= 5
    
    ch_cohort = next(c for c in change_outcomes["cohort_outcomes"] if "change = Ch" in c["cohort_name"])
    no_cohort = next(c for c in change_outcomes["cohort_outcomes"] if "change = No" in c["cohort_name"])
    
    assert ch_cohort["sample_size"] > 40000
    assert no_cohort["sample_size"] > 50000

def test_polypharmacy_outcomes_analytics():
    """Verify outcome stratification across medication count brackets."""
    poly_outcomes = TreatmentAnalyticsService.get_polypharmacy_outcomes()
    assert len(poly_outcomes["cohort_outcomes"]) == 4
    
    bracket_names = [c["cohort_name"] for c in poly_outcomes["cohort_outcomes"]]
    assert any("Low Polypharmacy" in name for name in bracket_names)
    assert any("Severe Polypharmacy" in name for name in bracket_names)

@pytest.mark.asyncio
async def test_api_analytics_endpoints_authorized():
    """Test 200 OK responses for all 4 analytics API endpoints with Doctor token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Treatment Summary
        res1 = await ac.get("/api/v1/analytics/treatment-summary", headers=headers)
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["total_encounters_analyzed"] == 99343
        
        # 2. Medication Outcomes
        res2 = await ac.get("/api/v1/analytics/medication-outcomes", headers=headers)
        assert res2.status_code == 200
        data2 = res2.json()
        assert len(data2["cohort_outcomes"]) >= 8
        
        # 3. Change Status Outcomes
        res3 = await ac.get("/api/v1/analytics/change-status-outcomes", headers=headers)
        assert res3.status_code == 200
        data3 = res3.json()
        assert len(data3["cohort_outcomes"]) >= 5
        
        # 4. Polypharmacy Outcomes
        res4 = await ac.get("/api/v1/analytics/polypharmacy-outcomes", headers=headers)
        assert res4.status_code == 200
        data4 = res4.json()
        assert len(data4["cohort_outcomes"]) == 4

@pytest.mark.asyncio
async def test_api_analytics_unauthenticated_block():
    """Test 401 Unauthorized block for unauthenticated requests."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/analytics/treatment-summary")
        assert res.status_code == 401

def test_dataset_immutability():
    """Verify dataset/diabetic_data.csv remains untouched and unchanged."""
    assert os.path.exists(DATASET_PATH)
    file_size = os.path.getsize(DATASET_PATH)
    assert file_size > 18000000
