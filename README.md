# HealthForecast AI: Hospital Readmission Prediction & Patient Risk Intelligence System

## Project Overview

HealthForecast AI is an AI-powered healthcare analytics platform that predicts hospital readmissions, identifies high-risk patients, evaluates treatment effectiveness, and provides healthcare analytics through a centralized platform.

## Milestone 1 Scope

This milestone includes:
- Full-stack project initialization (React + Tailwind, FastAPI, PostgreSQL)
- System architecture design
- Database schema implementation
- JWT Authentication & Role-Based Access Control (RBAC)
- User roles: Doctor, Hospital Administrator, Healthcare Researcher, System Administrator
- Frontend pages: Login, Dashboard, Patient Management, User Management
- Healthcare dashboard with analytics
- Patient management CRUD operations
- Diabetes 130-US Hospitals Dataset integration
- REST APIs for all modules
- Complete documentation

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- React Router
- Axios
- Recharts (for analytics)

### Backend
- FastAPI (Python 3.10+)
- PostgreSQL
- SQLAlchemy
- PyJWT (JWT Authentication)
- Passlib (Password Hashing)
- Python-multipart
- Pandas (Data Processing)

## Project Structure

```
HealthForecast AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
├── docs/
│   ├── architecture.md
│   ├── api-documentation.md
│   └── er-diagram.md
├── postman/
│   └── HealthForecast_AI.postman_collection.json
└── README.md
```

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. Start the development server:
```bash
npm start
```

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE healthforecast_ai;
```

2. Run schema script:
```bash
psql -U your_username -d healthforecast_ai -f database/schema.sql
```

3. Run seed data (optional):
```bash
psql -U your_username -d healthforecast_ai -f database/seeds/seed_data.sql
```

## User Roles & Permissions

### Doctor
- View assigned patients
- View medical history
- View risk reports
- Generate patient outcome reports

### Hospital Administrator
- View hospital dashboards
- View analytics
- Generate reports

### Healthcare Researcher
- Access anonymized datasets
- View aggregated reports
- Export research datasets

### System Administrator
- Manage users
- Manage roles
- Manage datasets
- Manage AI models
- Access audit logs

## API Documentation

API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

Detailed API documentation: [docs/api-documentation.md](docs/api-documentation.md)

## Default Credentials

After running seed data, you can login with:

**System Administrator:**
- Email: admin@healthforecast.ai
- Password: Admin@123

**Doctor:**
- Email: doctor@healthforecast.ai
- Password: Doctor@123

**Hospital Administrator:**
- Email: hospital_admin@healthforecast.ai
- Password: Hospital@123

**Healthcare Researcher:**
- Email: researcher@healthforecast.ai
- Password: Researcher@123

## Development

### Running Tests

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm test
```

### Code Style

Backend follows PEP 8 guidelines.
Frontend follows ESLint and Prettier configurations.

## License

This project is proprietary and confidential.

## Support

For support, contact the development team at dev@healthforecast.ai
