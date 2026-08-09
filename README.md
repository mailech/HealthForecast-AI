# HealthForecast AI

HealthForecast AI is a healthcare platform designed to manage patient information and predict patient readmission risk using Machine Learning.

The project combines a React frontend, Node.js backend, MongoDB database, and a Python-based Machine Learning prediction service into a unified healthcare platform.

---

## Features

* **Patient Management:** Store and manage patient profiles, records, and clinical data.
* **Risk Prediction:** Predict patient readmission risk dynamically based on health indicators.
* **Prediction History:** Log, view, and audit past readmission predictions over time.
* **Alerts & Notifications:** Real-time updates and alerts triggered by risk status changes.
* **Analytics Dashboard:** Graphical summary of patient metrics, risk distributions, and statistics.
* **Reports:** Generate structured exportable reports for clinical overview.
* **User Authentication & RBAC:** Secure access control with multi-tier roles (Admin, Doctor, Nurse).
* **Audit Logging:** System-wide tracking of user actions and record modifications for compliance.
* **REST & Real-Time APIs:** Express REST endpoints supplemented by Socket.IO for live updates.
* **Docker Support:** Fully containerized services using Docker Compose for local development and deployment.
* **CI/CD Pipeline:** Automated integration testing and build verification via GitHub Actions.

---

## Technology Stack

### Frontend

* React.js (Vite)
* JavaScript (ES6+)
* CSS
* Axios

### Backend

* Node.js
* Express.js
* Mongoose
* Socket.IO

### Database

* MongoDB Atlas
* MongoDB

### Machine Learning

* Python
* Flask
* Scikit-learn
* Machine Learning Model (`model.pkl`)
* Feature Scaling (`scaler.pkl`)

### DevOps & Infrastructure

* Docker
* Docker Compose
* Git
* GitHub
* GitHub Actions

---

## Project Architecture

```text
                         HealthForecast AI
                                |
                                v
                         React Frontend
                                |
                                v
                     Node.js + Express Backend
                         /              \
                        /                \
                       v                  v
                MongoDB Atlas         ML Service
                                      Python/Flask
                                           |
                                           v
                                  Machine Learning Model
                                           |
                                           v
                                  Readmission Risk
                                           |
                                           v
                                    Backend API
                                           |
                                           v
                                    React Frontend

```

---

## Project Structure

```text
HealthForecast-AI/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── alertController.js
│   │   ├── auditController.js
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   └── predictionController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── rbacMiddleware.js
│   ├── models/
│   │   ├── AccessRequest.js
│   │   ├── Alert.js
│   │   ├── AuditLog.js
│   │   ├── Patient.js
│   │   ├── PredictionHistory.js
│   │   └── User.js
│   ├── routes/
│   │   ├── alertRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   └── predictionRoutes.js
│   ├── tests/
│   │   └── api.test.js
│   ├── utils/
│   │   ├── auditLogger.js
│   │   ├── cryptoUtils.js
│   │   └── sendEmail.js
│   ├── Dockerfile
│   ├── package.json
│   ├── seed.js
│   ├── server.js
│   └── socket.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── ml_service/
│   ├── app.py
│   ├── Dockerfile
│   ├── model.pkl
│   ├── model_version.json
│   ├── requirements.txt
│   ├── scaler.pkl
│   └── train_model.py
│
├── e2e/
├── docker-compose.yml
├── .gitignore
└── README.md

```

---

## Machine Learning Service

The Machine Learning service is responsible for predicting patient readmission risk based on clinical features and historical health data.

### Workflow

```text
Patient Data ──> Data Preprocessing ──> Feature Scaling ──> Trained Model ──> Risk Prediction

```

### Artifacts & Key Files

* Model Artifact: `ml_service/model.pkl`
* Scaler Artifact: `ml_service/scaler.pkl`
* Training Pipeline: `ml_service/train_model.py`
* API Entrypoint: `ml_service/app.py`

---

## Backend Services & APIs

The backend serves as the core coordinator between the database, ML microservice, and frontend interface.

### Primary Responsibilities

* Authentication & Authorization (JWT + Role-Based Access Control)
* Rate limiting & API protection
* Real-time notifications via Socket.IO
* Audit trail generation
* Interfacing with MongoDB via Mongoose

### Key Endpoint Routes

| Route Base | Description |
| --- | --- |
| `/api/auth` | Login, registration, password management |
| `/api/patients` | Patient CRUD, health history records |
| `/api/predictions` | Submit clinical features to ML engine & view past risk history |
| `/api/alerts` | Active patient notifications and status flags |
| `/api/audit` | System access logs and operational history |

---

## Authentication & Security

1. **Role-Based Access Control (RBAC):** Restricts administrative functions, patient writes, and audit logs according to user role permissions.
2. **Rate Limiting:** Protects backend routes against brute force attempts.
3. **Audit Logging:** Automatically logs read, write, and predictive actions along with timestamps and user identifiers.
4. **Environment Isolation:** Credentials, tokens, and database URIs are managed via standard `.env` variables and kept out of version control.

---

## Installation & Setup

### Prerequisites

* Node.js
* npm
* Python
* pip
* Git
* MongoDB Atlas account
* Docker & Docker Compose (Optional)

---

### Option A: Local Development Setup

#### 1. Backend Service

```bash
cd backend
npm install

```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ML_SERVICE_URL=http://localhost:5001

```

Start the backend:

```bash
node server.js

```

The backend runs on: `http://localhost:5000`

#### 2. Frontend Application

```bash
cd frontend
npm install
npm run dev

```

The Vite development server will display the frontend URL in the terminal.

#### 3. Machine Learning Service

```bash
cd ml_service
pip install -r requirements.txt
python app.py

```

The ML service runs on: `http://localhost:5001`

---

### Option B: Docker Compose Setup

Run the entire platform in isolated containers:

```bash
docker compose up --build

```

To stop the services:

```bash
docker compose down

```

---

## Environment Variables

Ensure `.env` files are created in the respective directories before running the application.

Example `.env` configuration for `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ML_SERVICE_URL=http://localhost:5001

```

> Security Note: Never upload or commit `.env` files containing sensitive keys or credentials. The `.gitignore` file is configured to exclude them.

---

## Testing

```bash
# Run backend API tests
cd backend
npm test

# Run end-to-end tests
cd e2e
npm test

```

---

## CI/CD Pipeline

The project contains a GitHub Actions workflow located at `.github/workflows/ci-cd.yml` for automated project validation and CI/CD processes.

On every push or pull request to `main`:

1. Environment setup & dependency installation
2. Automated API and unit test execution
3. Docker build verification

---

## Development Workflow

Team members work on separate feature branches instead of directly modifying the `main` branch.

```text
main
 |
 +-- feature-branch-1
 |
 +-- feature-branch-2

```

Command example:

```bash
git checkout -b feature/your-feature-name

```

After completing a feature, create a Pull Request for review before merging into `main`.

---

## Future Enhancements

* Improve Machine Learning prediction accuracy
* Add additional healthcare prediction models
* Enhance analytics and visualization
* Improve patient risk monitoring
* Expand notification capabilities
* Add more automated tests
* Add ML model monitoring and version management