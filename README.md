# Final Healthcare

## AI-Powered Healthcare Management System

Final Healthcare is a web-based healthcare management platform that helps healthcare organizations manage patients, healthcare professionals, treatment information, AI-based health risk predictions, readmission analysis, analytics, and reports through a secure role-based system.

## User Roles

- Hospital Administrator
- Doctor
- Researcher
- System Administrator

## Main Features

- Secure user authentication
- Role-based access control
- Patient management
- AI-based health risk prediction
- Readmission analysis
- Treatment management
- Healthcare analytics
- Report generation
- User management
- System administration
- Audit and security features

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt

### Database
- MySQL 8.0

### Deployment
- Docker
- Docker Compose

## Project Structure

```text
final-healthcare/
├── ai-service/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── .dockerignore
├── database/
│   └── final_healthcare.sql
├── docker-compose.yml
└── README.md