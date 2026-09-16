# HealthForecast-AI

HealthForecast-AI is an AI-assisted healthcare management system designed to help healthcare professionals manage patient records, analyze healthcare data, and assess patient readmission risk.

## Features

### Authentication & RBAC

* JWT-based authentication
* Role-based access control
* Admin, Doctor, Staff, and Researcher roles
* Protected API endpoints
* Admin user management

### Healthcare Management

* Patient management
* Add, edit, and delete patient records
* Patient search
* Admission history
* Clinical analytics
* Treatment effectiveness
* Medication effectiveness
* Recovery analysis
* Clinical decision support
* Notifications and alerts

### AI & Machine Learning

* Readmission risk prediction
* Logistic Regression model
* Real machine learning prediction service
* Risk probability visualization
* Risk classification: Low, Medium, High
* Model evaluation using Accuracy, Recall, ROC-AUC, and Confusion Matrix
* Class imbalance handling using balanced class weights
* Threshold-based risk classification

### Research & Analytics

* Research dashboard
* Aggregate healthcare statistics
* High-risk patient analysis
* Prediction statistics
* ML model performance metrics
* Research data export
* Privacy-protected aggregate data
* Researcher role access

## Machine Learning

The project uses the **Diabetes 130-US Hospitals** dataset.

* Records: 101,766
* Features: 50
* Target: Patient Readmission
* Model: Logistic Regression
* Class imbalance handled using `class_weight="balanced"`
* Stratified train/test split
* Model evaluation:

  * Accuracy
  * Recall
  * ROC-AUC
  * Confusion Matrix
  * True Positives
  * True Negatives
  * False Positives
  * False Negatives

The trained model is saved as:

```text
backend/ml/readmission_model.joblib
```

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Recharts
* Axios
* Lucide React

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* JWT Authentication
* bcrypt

### Machine Learning

* Python
* Pandas
* scikit-learn
* Joblib

## Project Structure

```text
HealthForecast-AI/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── ml/
│   │   ├── model_service.py
│   │   ├── train_model.py
│   │   └── readmission_model.joblib
│   │
│   └── data/
│       └── diabetic_data.csv
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── api/
        └── App.jsx
```

## User Roles

| Role       | Access                                                  |
| ---------- | ------------------------------------------------------- |
| Admin      | Full system access and user management                  |
| Doctor     | Patient management, predictions, analytics and research |
| Staff      | Patient and healthcare management                       |
| Researcher | Research analytics and aggregate research data          |

## Data Validation & Security

* Request validation using Pydantic
* Email format validation
* Age and score range validation
* JWT authentication
* Role-based endpoint protection
* Protected patient and prediction APIs
* Research API restricted by role

## Research Privacy

Research endpoints provide aggregate statistics only.

Patient names, emails, IDs, and other personally identifiable information are not included in research responses or research exports.

## Running the Project

### Backend

Open a terminal:

```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Database

The application uses PostgreSQL for storing:

* Users
* Patient records
* Admissions
* Predictions
* Clinical analytics
* Treatment records
* Medication records
* Recovery records
* Notifications

Make sure PostgreSQL is running before starting the backend.
 
