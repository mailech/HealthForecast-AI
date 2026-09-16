import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import asyncio
from ml.main import app, EncounterFeatures, compute_in_memory_inference

async def test_lifespan():
    # Simulate FastAPI Lifespan context manager startup
    async with app.router.lifespan_context(app):
        print("[TEST] Lifespan startup executed.")
        assert hasattr(app.state, "model_data"), "app.state must have model_data"
        assert app.state.model_data is not None, "model_data must not be None"
        print("[TEST] In-memory model loaded:", app.state.model_data["metrics"]["model_name"])
        print("[TEST] Scale pos weight in memory:", app.state.model_data["metrics"]["scale_pos_weight"])

        # Test inference using in-memory model
        encounter = EncounterFeatures(
            patient_id="PT-222157",
            time_in_hospital=7,
            num_lab_procedures=64,
            num_medications=28,
            number_diagnoses=9,
            a1c_result=">8",
            change_in_meds=False,
            diabetes_med=True
        )

        resp = compute_in_memory_inference(app.state.model_data, encounter)
        print(f"[TEST] Inference Success!")
        print(f"       Probability: {resp.readmission_probability}%")
        print(f"       Risk Category: {resp.risk_category}")
        print(f"       Inference Latency: {resp.inference_latency_ms:.3f} ms (sub-millisecond in memory!)")
        print(f"       Contributors count: {len(resp.key_contributors)}")
        assert resp.inference_latency_ms < 50, "Inference must be low latency in memory"

    print("[TEST] Lifespan shutdown executed successfully.")

if __name__ == "__main__":
    asyncio.run(test_lifespan())
