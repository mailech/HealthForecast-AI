# HealthForecast AI - Prediction Visibility Fix

## What was fixed

1. **New users no longer need patient assignment to see the historical dataset predictions.**
   - Doctors, hospital administrators, healthcare researchers, and system administrators can access predictions generated for the Diabetes 130-US Hospitals dataset.
   - Researchers still see anonymized patient information.

2. **Prediction values are now returned for researcher records.**
   - `predicted_readmission_probability`
   - `predicted_risk_category`
   - `model_version`

3. **Dashboard analytics use the same shared dataset scope.**
   - A newly created doctor/researcher/hospital administrator will see the same dataset-level prediction statistics immediately after login.

4. **New manually created patients receive a prediction automatically.**
   - The prediction is created when the patient record is created, instead of waiting for the user to press Recalculate.

5. **Frontend now displays prediction columns for every role that can view patient/dataset records.**
   - The Risk Prediction page is also available to all four roles.

## Important behavior

Predictions belong to **patient records**, not to user accounts. Creating a new user therefore must not create duplicate predictions. The existing prediction attached to each patient is shared with every authorized role.

Research users see anonymized patient identity/details while retaining the risk prediction for analytical use.

## Validation performed

- Python backend source compiled successfully.
- Existing backend test suite passed.
- Backend started successfully.
- A newly created doctor account was tested and received dataset records with prediction values.
- Healthcare researcher was tested and received anonymized records with prediction values.
- Hospital administrator was tested and received records with prediction values.
- Dashboard returned 101,766 dataset encounters with 101,766 predictions in the validation database.

## Run

Backend:
```text
cd backend
python -m uvicorn app.main:app --reload
```

Frontend:
```text
cd frontend
npm install
npm run dev
```

The application uses the existing SQLite database, dataset, and trained model included in this package.
