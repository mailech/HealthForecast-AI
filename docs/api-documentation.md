# HealthForecast AI - API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All API endpoints (except login) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this format:

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

## Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### Login
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@healthforecast.ai",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@healthforecast.ai",
    "username": "admin",
    "full_name": "System Administrator",
    "role_id": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
}
```

### Register
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "full_name": "New User",
  "password": "SecurePassword123",
  "role_id": 2
}
```

**Response:**
```json
{
  "id": 5,
  "email": "newuser@example.com",
  "username": "newuser",
  "full_name": "New User",
  "role_id": 2,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}
```

---

## User Endpoints

### Get Current User
**GET** `/api/users/me`

Get information about the currently authenticated user.

**Response:**
```json
{
  "id": 1,
  "email": "admin@healthforecast.ai",
  "username": "admin",
  "full_name": "System Administrator",
  "role_id": 1,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}
```

**Permissions:** All authenticated users

### Get All Users
**GET** `/api/users?skip=0&limit=100`

Get list of all users (System Administrator only).

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum records to return (default: 100, max: 100)

**Response:**
```json
[
  {
    "id": 1,
    "email": "admin@healthforecast.ai",
    "username": "admin",
    "full_name": "System Administrator",
    "role_id": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

**Permissions:** System Administrator

### Get User by ID
**GET** `/api/users/{user_id}`

Get specific user by ID.

**Response:** Same as Get Current User

**Permissions:** System Administrator

### Create User
**POST** `/api/users`

Create a new user (System Administrator only).

**Request Body:** Same as Register endpoint

**Response:** Same as Register endpoint

**Permissions:** System Administrator

### Delete User
**DELETE** `/api/users/{user_id}`

Delete a user (System Administrator only).

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Permissions:** System Administrator

---

## Patient Endpoints

### Get All Patients
**GET** `/api/patients?skip=0&limit=100&search=&is_active=`

Get list of patients with optional filtering.

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Maximum records to return
- `search` (string, optional): Search by name or patient ID
- `is_active` (boolean, optional): Filter by active status

**Response:**
```json
[
  {
    "id": 1,
    "patient_id": "PAT001",
    "first_name": "John",
    "last_name": "Smith",
    "date_of_birth": "1980-05-15",
    "gender": "Male",
    "phone": "555-0101",
    "email": "john.smith@email.com",
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip_code": "62701",
    "emergency_contact_name": "Jane Smith",
    "emergency_contact_phone": "555-0102",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Get Patient by ID
**GET** `/api/patients/{patient_id}`

Get specific patient by ID.

**Response:** Same as Get All Patients

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Create Patient
**POST** `/api/patients`

Create a new patient record.

**Request Body:**
```json
{
  "patient_id": "PAT011",
  "first_name": "Jane",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "gender": "Female",
  "phone": "555-9999",
  "email": "jane.doe@email.com",
  "address": "456 Oak Ave",
  "city": "Chicago",
  "state": "IL",
  "zip_code": "60601",
  "emergency_contact_name": "John Doe",
  "emergency_contact_phone": "555-8888"
}
```

**Response:** Same as Get All Patients

**Permissions:** Doctor, System Administrator

### Update Patient
**PUT** `/api/patients/{patient_id}`

Update patient information.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith-Doe",
  "phone": "555-7777"
}
```

**Response:** Same as Get All Patients

**Permissions:** Doctor, System Administrator

### Delete Patient
**DELETE** `/api/patients/{patient_id}`

Delete a patient record.

**Response:**
```json
{
  "message": "Patient deleted successfully"
}
```

**Permissions:** System Administrator

---

## Medical History Endpoints

### Get Patient Medical History
**GET** `/api/medical-history/patient/{patient_id}`

Get all medical history records for a specific patient.

**Response:**
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "condition": "Type 2 Diabetes",
    "diagnosis_date": "2018-03-10T00:00:00Z",
    "status": "Active",
    "notes": "Managed with Metformin",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Get Medical History by ID
**GET** `/api/medical-history/{history_id}`

Get specific medical history record.

**Response:** Same as Get Patient Medical History

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Create Medical History
**POST** `/api/medical-history`

Create a new medical history record.

**Request Body:**
```json
{
  "patient_id": 1,
  "condition": "Hypertension",
  "diagnosis_date": "2024-01-15T00:00:00Z",
  "status": "Active",
  "notes": "New diagnosis"
}
```

**Response:** Same as Get Patient Medical History

**Permissions:** Doctor, System Administrator

### Update Medical History
**PUT** `/api/medical-history/{history_id}`

Update medical history record.

**Request Body:**
```json
{
  "status": "Resolved",
  "notes": "Condition resolved with treatment"
}
```

**Response:** Same as Get Patient Medical History

**Permissions:** Doctor, System Administrator

### Delete Medical History
**DELETE** `/api/medical-history/{history_id}`

Delete medical history record.

**Response:**
```json
{
  "message": "Medical history deleted successfully"
}
```

**Permissions:** System Administrator

---

## Admission Endpoints

### Get Patient Admissions
**GET** `/api/admissions/patient/{patient_id}`

Get all admissions for a specific patient.

**Response:**
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "admission_number": "ADM001",
    "admission_date": "2023-01-15",
    "discharge_date": "2023-01-20",
    "admission_type": "Emergency",
    "department": "Internal Medicine",
    "room_number": "301",
    "attending_physician": "Dr. Sarah Johnson",
    "diagnosis": "Diabetic ketoacidosis",
    "discharge_diagnosis": "Resolved DKA",
    "length_of_stay": 5,
    "readmission_flag": "No",
    "readmission_reason": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Get All Admissions
**GET** `/api/admissions?skip=0&limit=100`

Get list of all admissions.

**Response:** Same as Get Patient Admissions

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Get Admission by ID
**GET** `/api/admissions/{admission_id}`

Get specific admission by ID.

**Response:** Same as Get Patient Admissions

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Create Admission
**POST** `/api/admissions`

Create a new admission record.

**Request Body:**
```json
{
  "patient_id": 1,
  "admission_number": "ADM011",
  "admission_date": "2024-01-20",
  "admission_type": "Emergency",
  "department": "Internal Medicine",
  "room_number": "302",
  "attending_physician": "Dr. Sarah Johnson",
  "diagnosis": "Chest pain"
}
```

**Response:** Same as Get Patient Admissions

**Permissions:** Doctor, System Administrator

### Update Admission
**PUT** `/api/admissions/{admission_id}`

Update admission record.

**Request Body:**
```json
{
  "discharge_date": "2024-01-25",
  "discharge_diagnosis": "Stable angina",
  "length_of_stay": 5
}
```

**Response:** Same as Get Patient Admissions

**Permissions:** Doctor, System Administrator

### Delete Admission
**DELETE** `/api/admissions/{admission_id}`

Delete admission record.

**Response:**
```json
{
  "message": "Admission deleted successfully"
}
```

**Permissions:** System Administrator

---

## Treatment Endpoints

### Get Patient Treatments
**GET** `/api/treatments/patient/{patient_id}`

Get all treatments for a specific patient.

**Response:**
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "admission_id": 1,
    "treatment_name": "Insulin Therapy",
    "treatment_type": "Medication",
    "start_date": "2023-01-15T00:00:00Z",
    "end_date": "2023-01-20T00:00:00Z",
    "dosage": "Sliding scale",
    "frequency": "QID",
    "prescribed_by": "Dr. Sarah Johnson",
    "notes": "Blood glucose monitoring",
    "outcome": "Effective",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Get Admission Treatments
**GET** `/api/treatments/admission/{admission_id}`

Get all treatments for a specific admission.

**Response:** Same as Get Patient Treatments

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Get All Treatments
**GET** `/api/treatments?skip=0&limit=100`

Get list of all treatments.

**Response:** Same as Get Patient Treatments

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Get Treatment by ID
**GET** `/api/treatments/{treatment_id}`

Get specific treatment by ID.

**Response:** Same as Get Patient Treatments

**Permissions:** Doctor, Hospital Administrator, System Administrator

### Create Treatment
**POST** `/api/treatments`

Create a new treatment record.

**Request Body:**
```json
{
  "patient_id": 1,
  "admission_id": 1,
  "treatment_name": "Antibiotic Therapy",
  "treatment_type": "Medication",
  "start_date": "2024-01-20T00:00:00Z",
  "dosage": "500mg",
  "frequency": "BID",
  "prescribed_by": "Dr. Sarah Johnson"
}
```

**Response:** Same as Get Patient Treatments

**Permissions:** Doctor, System Administrator

### Update Treatment
**PUT** `/api/treatments/{treatment_id}`

Update treatment record.

**Request Body:**
```json
{
  "end_date": "2024-01-25T00:00:00Z",
  "outcome": "Completed"
}
```

**Response:** Same as Get Patient Treatments

**Permissions:** Doctor, System Administrator

### Delete Treatment
**DELETE** `/api/treatments/{treatment_id}`

Delete treatment record.

**Response:**
```json
{
  "message": "Treatment deleted successfully"
}
```

**Permissions:** System Administrator

---

## Dashboard Endpoints

### Get Dashboard Statistics
**GET** `/api/dashboard/stats`

Get dashboard statistics and metrics.

**Response:**
```json
{
  "total_patients": 10,
  "total_admissions": 10,
  "total_discharges": 10,
  "high_risk_patients": 10,
  "readmission_rate": 20.0,
  "active_admissions": 0
}
```

**Permissions:** Doctor, Hospital Administrator, System Administrator

---

## Dataset Endpoints

### Integrate Dataset
**POST** `/api/dataset/integrate?dataset_path=`

Integrate Diabetes 130-US Hospitals Dataset into the database.

**Query Parameters:**
- `dataset_path` (string, optional): Path to the dataset CSV file

**Response:**
```json
{
  "message": "Dataset integration completed successfully"
}
```

**Permissions:** System Administrator

---

## Role-Based Access Control

### User Roles and Permissions

#### System Administrator
- Full access to all endpoints
- User and role management
- Dataset integration
- Audit log access

#### Doctor
- Patient management (CRUD)
- Medical history management
- Admission management
- Treatment management
- Dashboard access

#### Hospital Administrator
- View patients (read-only)
- View admissions (read-only)
- Dashboard access
- Generate reports

#### Healthcare Researcher
- Access anonymized datasets
- View aggregated reports
- Export research data

---

## Error Handling

### Common Errors

#### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```
**Solution:** Check that your JWT token is valid and not expired.

#### 403 Forbidden
```json
{
  "detail": "Insufficient permissions"
}
```
**Solution:** Ensure your user role has the required permissions.

#### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```
**Solution:** Verify the resource ID is correct.

#### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
**Solution:** Check request body for missing or invalid fields.

---

## Rate Limiting
Currently, no rate limiting is implemented. This will be added in future versions.

## Pagination
List endpoints support pagination using `skip` and `limit` parameters:
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 100, max: 100)

## Search
Some endpoints support search functionality:
- Patients: Search by name or patient ID
- Users: Search by email or username

## Filtering
Endpoints support filtering via query parameters:
- Patients: Filter by `is_active` status
- Admissions: Filter by various fields

## Sorting
Currently, sorting is not implemented. This will be added in future versions.

## Webhooks
Currently, no webhooks are implemented. This will be added in future versions for real-time notifications.

## SDKs
Currently, no official SDKs are available. Use the REST API directly.

## Support
For API support, contact: api-support@healthforecast.ai
