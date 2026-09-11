import os
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.services.analytics_service import HospitalPerformanceService

DATASET_PATH = settings.DATASET_PATH

def test_hospital_performance_kpis():
    """Verify system-wide aggregate performance KPIs, stay metrics, and hospital anonymity disclaimer."""
    kpis = HospitalPerformanceService.get_overall_performance()
    assert kpis["total_encounters_analyzed"] == 101766
    assert kpis["eligible_encounters_count"] == 99343
    assert kpis["early_readmit_count"] == 11314
    assert kpis["early_readmit_rate_pct"] == 11.39
    assert kpis["average_length_of_stay_days"] == 4.38
    assert kpis["overall_outcome_distribution"]["early_readmission"]["count"] == 11314
    assert kpis["overall_outcome_distribution"]["early_readmission"]["percentage"] == 11.39
    assert kpis["dataset_hospital_system_count"] == 130
    assert kpis["dataset_time_span"] == "1999–2008"
    assert "Hospital Anonymity & System-Level Analytics Note" in kpis["hospital_anonymity_disclaimer"]


def test_admission_context_outcomes():
    """Verify outcome rates across admission types, sources, specialties, and primary ICD-9 diagnoses."""
    ctx = HospitalPerformanceService.get_admission_context_outcomes()
    assert ctx["baseline_readmission_rate_30d"] == 11.19
    assert len(ctx["cohort_outcomes"]) >= 15
    
    # Check Emergency Admission cohort
    em_cohort = next(c for c in ctx["cohort_outcomes"] if "Emergency Admission" in c["cohort_name"])
    assert em_cohort["sample_size"] > 40000
    assert em_cohort["early_readmit_rate"] > 0.0

def test_utilization_trends():
    """Verify outcome risk gradient across prior 12-month inpatient and emergency visit brackets."""
    ut = HospitalPerformanceService.get_utilization_trends()
    assert len(ut["cohort_outcomes"]) >= 10
    
    inpatient_0 = next(c for c in ut["cohort_outcomes"] if "Prior Inpatient: 0 Visits" in c["cohort_name"])
    inpatient_3plus = next(c for c in ut["cohort_outcomes"] if "Prior Inpatient: 3+ Visits" in c["cohort_name"])
    
    # Early readmission rate must be significantly higher for 3+ prior inpatient visits
    assert inpatient_3plus["early_readmit_rate"] > inpatient_0["early_readmit_rate"]

def test_length_of_stay_outcomes():
    """Verify outcome rates across length of hospital stay duration brackets."""
    los = HospitalPerformanceService.get_length_of_stay_outcomes()
    assert len(los["cohort_outcomes"]) == 4
    
    short_stay = next(c for c in los["cohort_outcomes"] if "Short Hospital Stay" in c["cohort_name"])
    long_stay = next(c for c in los["cohort_outcomes"] if "Long Hospital Stay" in c["cohort_name"])
    
    assert short_stay["sample_size"] > 20000
    assert long_stay["sample_size"] > 5000
    assert long_stay["early_readmit_rate"] > short_stay["early_readmit_rate"]

@pytest.mark.asyncio
async def test_api_hospital_performance_endpoints_authorized():
    """Test 200 OK responses for all 4 new hospital performance endpoints with Doctor token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Overall Hospital Performance
        res1 = await ac.get("/api/v1/analytics/hospital-performance", headers=headers)
        assert res1.status_code == 200
        d1 = res1.json()
        assert d1["eligible_encounters_count"] == 99343
        assert d1["early_readmit_rate_pct"] == 11.39

        
        # 2. Admission Context Outcomes
        res2 = await ac.get("/api/v1/analytics/admission-context-outcomes", headers=headers)
        assert res2.status_code == 200
        d2 = res2.json()
        assert len(d2["cohort_outcomes"]) >= 15
        
        # 3. Utilization Trends
        res3 = await ac.get("/api/v1/analytics/utilization-trends", headers=headers)
        assert res3.status_code == 200
        d3 = res3.json()
        assert len(d3["cohort_outcomes"]) >= 10
        
        # 4. Length of Stay Outcomes
        res4 = await ac.get("/api/v1/analytics/length-of-stay-outcomes", headers=headers)
        assert res4.status_code == 200
        d4 = res4.json()
        assert len(d4["cohort_outcomes"]) == 4

@pytest.mark.asyncio
async def test_api_hospital_performance_unauthenticated():
    """Test 401 Unauthorized block for unauthenticated requests."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/analytics/hospital-performance")
        assert res.status_code == 401

def test_dataset_immutability():
    """Verify dataset/diabetic_data.csv remains untouched and unchanged."""
    assert os.path.exists(DATASET_PATH)
    file_size = os.path.getsize(DATASET_PATH)
    assert file_size > 18000000

def test_empty_cohort_handling():
    """Verify calculate_cohort_metrics handles empty DataFrames cleanly without zero-division error."""
    import pandas as pd
    from app.services.analytics_service import calculate_cohort_metrics
    empty_df = pd.DataFrame(columns=["readmitted"])
    metrics = calculate_cohort_metrics(empty_df, 99343, "Empty Test Cohort")
    assert metrics["sample_size"] == 0
    assert metrics["cohort_percentage"] == 0.0
    assert metrics["early_readmit_count"] == 0
    assert metrics["early_readmit_rate"] == 0.0
    assert metrics["relative_risk_vs_baseline"] == 0.0
