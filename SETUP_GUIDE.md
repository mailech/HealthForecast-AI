# HealthForecast AI - Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On Linux/Mac
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Initialize database
```bash
python db_init.py
```

### 6. Run the application
```bash
python run.py
```

The backend will be available at `http://localhost:5000`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Docker Setup (Future)

When ready to use Docker:

### 1. Build and start containers
```bash
cd docker
docker-compose up -d
```

### 2. View logs
```bash
docker-compose logs -f
```

### 3. Stop containers
```bash
docker-compose down
```

## Default Users

The system comes with pre-configured test users:

- **Admin**: username=`admin`, password=`admin123`
- **Doctor**: username=`doctor`, password=`doctor123`
- **Hospital Administrator**: username=`hospital_admin`, password=`hospital123`
- **Healthcare Researcher**: username=`researcher`, password=`researcher123`

## API Documentation

Once the backend is running, access Swagger UI at:
- `http://localhost:5000/api/docs`

## Project Structure

```
healthforecast-ai/
├── backend/                 # Flask backend
│   ├── app/                # Application code
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── auth/          # Authentication
│   │   └── ml/            # ML models
│   ├── requirements.txt
│   ├── run.py
│   └── db_init.py
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── stores/        # State management
│   ├── package.json
│   └── vite.config.ts
└── docker/                # Docker configuration
    ├── docker-compose.yml
    ├── Dockerfile.backend
    └── Dockerfile.frontend
```

## Troubleshooting

### Backend Issues

**Database connection error**: Ensure PostgreSQL is running and credentials in `.env` are correct.

**Module not found**: Make sure virtual environment is activated and dependencies are installed.

### Frontend Issues

**TypeScript errors**: Run `npm install` to install all dependencies.

**API connection error**: Ensure backend is running and CORS is configured correctly.

## Development Notes

- The system uses a simplified ML model for demonstration purposes
- Docker configuration is prepared but not required for local development
- All modules are implemented with proper RBAC and permission checking
- The frontend uses placeholder components that can be expanded as needed
