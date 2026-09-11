import os
import time
import asyncio
import pytest
import numpy as np
from httpx import AsyncClient, ASGITransport

from app.main import app
from ml.inference import get_inference_engine


def test_ml_inference_engine_performance():
    """Benchmark raw ML inference engine latency across 50 iterations."""
    engine = get_inference_engine()
    sample = {
        "race": "Caucasian",
        "gender": "Female",
        "age": "[60-70)",
        "admission_type_id": "1",
        "time_in_hospital": 4,
        "num_lab_procedures": 45,
        "num_procedures": 1,
        "num_medications": 14,
        "number_inpatient": 1,
        "number_emergency": 0,
        "number_outpatient": 0,
        "diag_1": "414",
        "diag_2": "250",
        "diag_3": "401",
        "number_diagnoses": 7,
        "insulin": "Up",
        "metformin": "Steady"
    }

    # Warmup prediction call
    engine.predict(sample)

    latencies_ms = []
    for _ in range(50):
        t0 = time.perf_counter()
        res = engine.predict(sample)
        t1 = time.perf_counter()
        latencies_ms.append((t1 - t0) * 1000)

    avg_latency = float(np.mean(latencies_ms))
    p95_latency = float(np.percentile(latencies_ms, 95))

    print(f"\n[BENCHMARK] Inference Latency: Avg={avg_latency:.2f}ms | p95={p95_latency:.2f}ms | Min={min(latencies_ms):.2f}ms | Max={max(latencies_ms):.2f}ms")

    # Performance assertions
    assert avg_latency < 50.0, f"Average inference latency too high: {avg_latency:.2f}ms"
    assert p95_latency < 100.0, f"p95 inference latency too high: {p95_latency:.2f}ms"


@pytest.mark.asyncio
async def test_concurrent_api_requests_handling():
    """Verify system stability and response time under 20 concurrent read-only / prediction requests."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Obtain auth token
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "race": "Caucasian",
            "gender": "Female",
            "age": "[60-70)",
            "admission_type_id": "1",
            "time_in_hospital": 3,
            "num_lab_procedures": 40,
            "num_procedures": 1,
            "num_medications": 12,
            "number_outpatient": 0,
            "number_emergency": 0,
            "number_inpatient": 1,
            "diag_1": "414",
            "diag_2": "250",
            "diag_3": "401",
            "number_diagnoses": 5,
            "insulin": "Steady"
        }

        async def send_prediction():
            t0 = time.perf_counter()
            resp = await client.post("/api/v1/predictions/predict", json=payload, headers=headers)
            t1 = time.perf_counter()
            return resp.status_code, (t1 - t0) * 1000

        # Launch 20 concurrent tasks
        tasks = [send_prediction() for _ in range(20)]
        results = await asyncio.gather(*tasks)

        status_codes = [r[0] for r in results]
        latencies = [r[1] for r in results]

        # Verify zero failures under concurrent load
        assert all(code == 200 for code in status_codes), f"Concurrent requests failed: {status_codes}"
        
        avg_conc_latency = float(np.mean(latencies))
        max_conc_latency = float(max(latencies))
        
        print(f"\n[BENCHMARK] Concurrent Requests (20 parallel): 100% Success | Avg Latency={avg_conc_latency:.2f}ms | Max Latency={max_conc_latency:.2f}ms")
