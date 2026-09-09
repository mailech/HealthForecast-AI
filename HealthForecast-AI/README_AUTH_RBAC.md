# Authentication, Registration and RBAC

The project now includes:

- Public account registration.
- Password hashing with bcrypt. Plain-text passwords are never stored in PostgreSQL.
- JWT login authentication.
- Four roles: Doctor, Hospital Administrator, Healthcare Researcher, System Administrator.
- Backend RBAC enforcement on protected API endpoints.
- Frontend route protection and role-based navigation.
- System Administrator user management for creating accounts with any of the four roles.
- Audit log entries for registration, login and System Administrator user creation.

## Public registration

The `/register` page creates a **Doctor** account. This prevents an unauthenticated visitor from registering as a privileged administrator.

System Administrator can create Hospital Administrator, Healthcare Researcher and System Administrator accounts from **User Management**.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Doctor | doctor@gmail.com | Doctor@123 |
| Hospital Administrator | hospitaladministration@gmail.com | HospitalAdmin@123 |
| Healthcare Researcher | hospitalresearcher@gmail.com | Researcher@123 |
| System Administrator | systemadmin@gmail.com | SystemAdmin@123 |

## RBAC behavior

- **Doctor:** sees assigned patients, can run predictions and manage treatment for assigned patients.
- **Hospital Administrator:** sees patients in the same hospital, can run predictions and manage treatment.
- **Healthcare Researcher:** read-oriented access to patients/predictions/analytics within the same hospital; cannot create treatments or users.
- **System Administrator:** system administration scope with User Management, Dataset Management, Audit Logs, and System Settings.

## Run

### Docker

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

### Seed demo data

If running the backend directly, start PostgreSQL first and run:

```bash
cd backend
python scripts/seed.py
```

Then start FastAPI and the React frontend as described in the main README.


## System Administrator dashboard
The System Administrator is restricted to system-level functions: User & Role Management, Dataset Management, Activity & Audit Logs, and System Settings. AI Model Management is not shown or accessible to the System Administrator. Clinical patient records, risk prediction, treatment entry, treatment analysis, and precautions are not shown or accessible from the System Administrator dashboard.
