# HealthForecast AI - System Architecture

## Overview

HealthForecast AI is a full-stack healthcare analytics platform built with React.js (frontend), FastAPI (backend), and PostgreSQL (database). The system follows a clean architecture pattern with separation of concerns across layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                        │
│                    React.js + Tailwind CSS                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │ Dashboard│  │ Patients │  │   Users  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                          API Layer                             │
│                          FastAPI                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Users   │  │ Patients │  │ Dashboard│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Medical   │  │Admission│  │Treatment │  │  Audit   │   │
│  │ History  │  │          │  │          │  │   Log    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ ORM (SQLAlchemy)
                              │
┌─────────────────────────────────────────────────────────────┐
│                       Business Logic Layer                    │
│                    Services & Dependencies                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Security │  │   RBAC   │  │ Validation│  │  Logging │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                               │
│                      PostgreSQL                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Roles   │  │ Patients │  │ Medical  │   │
│  │          │  │          │  │          │  │ History  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │Admission │  │Treatment │  │Audit Logs │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React.js 18
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (PyJWT)
- **Password Hashing**: Passlib with Bcrypt
- **Data Validation**: Pydantic
- **ASGI Server**: Uvicorn

### Database
- **Database**: PostgreSQL 14+
- **Connection**: psycopg2-binary
- **Migrations**: Alembic

## Module Structure

### Backend Structure
```
backend/
├── app/
│   ├── api/              # API Route Handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── users.py      # User management endpoints
│   │   ├── patients.py   # Patient CRUD endpoints
│   │   ├── medical_history.py
│   │   ├── admissions.py
│   │   ├── treatments.py
│   │   └── dashboard.py
│   ├── core/             # Core Configuration
│   │   ├── config.py     # Settings management
│   │   ├── database.py   # Database connection
│   │   ├── security.py   # JWT & password hashing
│   │   └── dependencies.py # Dependency injection
│   ├── models/           # SQLAlchemy Models
│   │   ├── user.py
│   │   ├── role.py
│   │   ├── patient.py
│   │   ├── medical_history.py
│   │   ├── admission.py
│   │   ├── treatment.py
│   │   └── audit_log.py
│   ├── schemas/          # Pydantic Schemas
│   │   ├── user.py
│   │   ├── role.py
│   │   ├── patient.py
│   │   └── ...
│   ├── services/         # Business Logic
│   └── main.py           # FastAPI application
├── alembic/              # Database migrations
├── tests/                # Unit tests
├── requirements.txt      # Python dependencies
└── .env.example          # Environment variables template
```

### Frontend Structure
```
frontend/
├── public/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/          # React Context
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PatientList.jsx
│   │   ├── PatientDetails.jsx
│   │   ├── UserManagement.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── Unauthorized.jsx
│   │   └── NotFound.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── package.json          # Node dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── .env.example         # Environment variables template
```

## Authentication Flow

1. **Login Request**
   - User submits credentials to `/api/auth/login`
   - Backend validates email/password
   - If valid, generates JWT token
   - Returns token with user data

2. **Token Storage**
   - Frontend stores token in localStorage
   - Token included in Authorization header for all requests

3. **Protected Routes**
   - Middleware validates JWT token
   - Extracts user ID from token
   - Loads user from database
   - Checks role permissions

4. **Role-Based Access Control (RBAC)**
   - Each endpoint specifies required roles
   - Middleware checks if user has required role
   - Returns 403 if unauthorized

## API Design Principles

1. **RESTful Design**
   - Resource-based URLs
   - HTTP methods for actions (GET, POST, PUT, DELETE)
   - Proper status codes
   - Consistent response format

2. **Versioning**
   - API version in URL: `/api/v1/`
   - Currently at version 1.0

3. **Error Handling**
   - Consistent error response format
   - Proper HTTP status codes
   - Detailed error messages

4. **Pagination**
   - Skip/limit parameters for list endpoints
   - Default limits to prevent large responses

5. **Validation**
   - Pydantic schemas for request validation
   - Automatic type checking
   - Clear validation error messages

## Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Bcrypt password hashing
   - Secure token storage

2. **Authorization**
   - Role-based access control
   - Permission middleware
   - Protected routes

3. **Data Protection**
   - SQL injection prevention (ORM)
   - XSS protection (React)
   - CORS configuration

4. **Audit Logging**
   - Track all CRUD operations
   - Log user actions
   - Store IP addresses and user agents

## Scalability Considerations

1. **Database**
   - Indexed foreign keys
   - Optimized queries
   - Connection pooling

2. **API**
   - Async/await for I/O operations
   - Efficient data loading
   - Pagination support

3. **Frontend**
   - Lazy loading components
   - Optimized re-renders
   - Efficient state management

## Deployment Architecture

```
┌─────────────────┐
│   Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ Front │ │ Front │
│ End 1 │ │ End 2 │
└───┬───┘ └──┬────┘
    │        │
    └────┬───┘
         │
    ┌────▼────┐
    │  API    │
    │ Gateway │
    └────┬────┘
         │
    ┌────▼────┐
    │  Back   │
    │  End    │
    └────┬────┘
         │
    ┌────▼────┐
    │Database │
    │ Cluster │
    └─────────┘
```

## Future Enhancements

1. **Caching Layer**: Redis for frequently accessed data
2. **Message Queue**: Celery for background tasks
3. **Monitoring**: Prometheus + Grafana
4. **Logging**: ELK Stack
5. **CDN**: CloudFront for static assets
6. **Containerization**: Docker + Kubernetes
