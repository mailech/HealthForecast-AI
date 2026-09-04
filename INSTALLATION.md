# HealthForecast AI - Installation Guide

## Prerequisites

Before installing HealthForecast AI, ensure you have the following installed:

- **Python**: 3.10 or higher
- **Node.js**: 18 or higher
- **PostgreSQL**: 14 or higher
- **Git**: For version control
- **npm**: Comes with Node.js

## System Requirements

### Minimum Requirements
- **RAM**: 4GB
- **Storage**: 10GB free space
- **CPU**: 2 cores

### Recommended Requirements
- **RAM**: 8GB or more
- **Storage**: 20GB or more
- **CPU**: 4 cores or more

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HealthForecast AI
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE healthforecast_ai;

# Exit
\q
```

#### Run Database Schema

```bash
psql -U postgres -d healthforecast_ai -f database/schema.sql
```

#### Load Seed Data (Optional)

```bash
psql -U postgres -d healthforecast_ai -f database/seeds/seed_data.sql
```

### 3. Backend Installation

#### Navigate to Backend Directory

```bash
cd backend
```

#### Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/healthforecast_ai
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Generate Secret Key

For production, generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

#### Verify Backend

Open your browser and visit:
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 4. Frontend Installation

#### Navigate to Frontend Directory

```bash
cd ../frontend
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Verification

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy"
}
```

### 2. Test API Documentation

Visit `http://localhost:8000/docs` in your browser to see the interactive API documentation.

### 3. Check Frontend

Visit `http://localhost:3000` in your browser to see the login page.

### 4. Test Login

Use the default credentials (if seed data was loaded):

**System Administrator:**
- Email: `admin@healthforecast.ai`
- Password: `Admin@123`

**Doctor:**
- Email: `doctor@healthforecast.ai`
- Password: `Doctor@123`

## Production Deployment

### Backend Production Setup

#### Use Production WSGI Server

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Environment Variables for Production

```env
DATABASE_URL=postgresql://user:password@production-host:5432/healthforecast_ai
SECRET_KEY=<secure-random-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

#### Security Considerations

1. Use strong, randomly generated SECRET_KEY
2. Enable HTTPS
3. Use environment-specific database credentials
4. Enable database SSL connections
5. Set up firewall rules
6. Regular security updates

### Frontend Production Build

```bash
npm run build
```

The build output will be in the `dist` directory.

Serve the built files using a web server like Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Production Setup

#### Enable SSL

```sql
ALTER DATABASE healthforecast_ai SET ssl = true;
```

#### Create Production User

```sql
CREATE USER healthforecast_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE healthforecast_ai TO healthforecast_user;
```

#### Regular Backups

```bash
pg_dump -U healthforecast_user healthforecast_ai > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find process using the port
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Mac/Linux

# Kill the process
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # Mac/Linux
```

#### Database Connection Failed

**Error:** `could not connect to server`

**Solution:**
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists
4. Check firewall settings

#### Module Not Found

**Error:** `ModuleNotFoundError: No module named '...'`

**Solution:**
```bash
# Ensure virtual environment is activated
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### Frontend Build Errors

**Error:** Build fails with dependency issues

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### CORS Errors

**Error:** CORS policy error in browser

**Solution:**
1. Check CORS configuration in `backend/app/main.py`
2. Ensure frontend URL is in allowed origins
3. Restart backend server

## Development Setup

### Running Tests

#### Backend Tests

```bash
cd backend
pytest
```

#### Frontend Tests

```bash
cd frontend
npm test
```

### Code Style

#### Backend (Python)

Install linting tools:
```bash
pip install black flake8
```

Run linter:
```bash
black app/
flake8 app/
```

#### Frontend (JavaScript)

Linting is configured in package.json:
```bash
npm run lint
```

### Database Migrations

Using Alembic for database migrations:

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Uninstallation

### Remove Backend

```bash
cd backend
deactivate  # Exit virtual environment
cd ..
rm -rf backend
```

### Remove Frontend

```bash
rm -rf frontend
```

### Remove Database

```bash
psql -U postgres
DROP DATABASE healthforecast_ai;
\q
```

## Support

For installation issues:
- Check the documentation: `docs/`
- Review error logs
- Check GitHub issues
- Contact: support@healthforecast.ai

## Next Steps

After installation:

1. Review the API documentation at `http://localhost:8000/docs`
2. Import the Postman collection from `postman/HealthForecast_AI.postman_collection.json`
3. Review the architecture documentation in `docs/architecture.md`
4. Customize the application for your needs
5. Set up monitoring and logging for production
