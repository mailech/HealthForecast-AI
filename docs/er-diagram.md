# HealthForecast AI - Entity Relationship Diagram

## Database Schema Overview

The database consists of 7 main tables with the following relationships:

```
┌─────────────┐       ┌─────────────┐
│    Roles    │──────┤    Users    │
│             │ 1:N  │             │
└─────────────┘       └──────┬──────┘
                             │ 1:N
                             │
                    ┌────────▼────────┐
                    │   Audit Logs    │
                    │                 │
                    └─────────────────┘

┌─────────────┐       ┌─────────────┐
│  Patients   │──────┤Medical Hist. │
│             │ 1:N  │             │
└──────┬──────┘       └─────────────┘
       │ 1:N
       │
┌──────▼──────┐       ┌─────────────┐
│ Admissions  │──────┤ Treatments  │
│             │ 1:N  │             │
└─────────────┘       └─────────────┘
```

## Table Relationships

### Users & Roles
- **Relationship**: Many-to-One (Many Users belong to One Role)
- **Foreign Key**: `users.role_id → roles.id`
- **Description**: Each user is assigned a single role (Doctor, Hospital Administrator, Healthcare Researcher, System Administrator)

### Users & Audit Logs
- **Relationship**: One-to-Many (One User can have many Audit Logs)
- **Foreign Key**: `audit_logs.user_id → users.id`
- **Description**: Tracks all actions performed by users for security and compliance

### Patients & Medical History
- **Relationship**: One-to-Many (One Patient can have many Medical History records)
- **Foreign Key**: `medical_history.patient_id → patients.id`
- **Description**: Stores all medical conditions and diagnoses for each patient

### Patients & Admissions
- **Relationship**: One-to-Many (One Patient can have many Admissions)
- **Foreign Key**: `admissions.patient_id → patients.id`
- **Description**: Records all hospital admissions for each patient

### Admissions & Treatments
- **Relationship**: One-to-Many (One Admission can have many Treatments)
- **Foreign Key**: `treatments.admission_id → admissions.id`
- **Description**: Links treatments to specific admissions

### Patients & Treatments
- **Relationship**: One-to-Many (One Patient can have many Treatments)
- **Foreign Key**: `treatments.patient_id → patients.id`
- **Description**: Direct link for treatments not tied to specific admissions

## Detailed Schema

### Roles Table
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Roles:**
1. System Administrator
2. Doctor
3. Hospital Administrator
4. Healthcare Researcher

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_username` on `username`
- `idx_users_role_id` on `role_id`

### Patients Table
```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
- `idx_patients_patient_id` on `patient_id`
- `idx_patients_name` on `(first_name, last_name)`
- `idx_patients_is_active` on `is_active`

### Medical History Table
```sql
CREATE TABLE medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    condition VARCHAR(255) NOT NULL,
    diagnosis_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
- `idx_medical_history_patient_id` on `patient_id`
- `idx_medical_history_condition` on `condition`

### Admissions Table
```sql
CREATE TABLE admissions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    admission_date DATE NOT NULL,
    discharge_date DATE,
    admission_type VARCHAR(50),
    department VARCHAR(100),
    room_number VARCHAR(20),
    attending_physician VARCHAR(255),
    diagnosis VARCHAR(500),
    discharge_diagnosis VARCHAR(500),
    length_of_stay INTEGER,
    readmission_flag VARCHAR(10) DEFAULT 'No',
    readmission_reason VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
- `idx_admissions_patient_id` on `patient_id`
- `idx_admissions_admission_number` on `admission_number`
- `idx_admissions_admission_date` on `admission_date`
- `idx_admissions_readmission_flag` on `readmission_flag`

### Treatments Table
```sql
CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    admission_id INTEGER REFERENCES admissions(id),
    treatment_name VARCHAR(255) NOT NULL,
    treatment_type VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    prescribed_by VARCHAR(255),
    notes TEXT,
    outcome VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
- `idx_treatments_patient_id` on `patient_id`
- `idx_treatments_admission_id` on `admission_id`
- `idx_treatments_treatment_name` on `treatment_name`

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_audit_logs_user_id` on `user_id`
- `idx_audit_logs_action` on `action`
- `idx_audit_logs_entity_type` on `entity_type`
- `idx_audit_logs_timestamp` on `timestamp`

## Constraints

### Primary Keys
- All tables have `id` as primary key (SERIAL auto-increment)

### Foreign Keys
- `users.role_id → roles.id` (ON DELETE RESTRICT)
- `audit_logs.user_id → users.id` (ON DELETE SET NULL)
- `medical_history.patient_id → patients.id` (ON DELETE CASCADE)
- `admissions.patient_id → patients.id` (ON DELETE CASCADE)
- `treatments.patient_id → patients.id` (ON DELETE CASCADE)
- `treatments.admission_id → admissions.id` (ON DELETE SET NULL)

### Unique Constraints
- `roles.name`
- `users.email`
- `users.username`
- `patients.patient_id`
- `admissions.admission_number`

### Not Null Constraints
- All required fields as specified in schema above

### Check Constraints
- `users.is_active` must be BOOLEAN
- `patients.gender` must be one of: 'Male', 'Female', 'Other'
- `admissions.readmission_flag` must be 'Yes' or 'No'

## Data Types

### Common Types
- **SERIAL**: Auto-incrementing integer (primary keys)
- **VARCHAR(n)**: Variable-length string with max length
- **TEXT**: Unlimited length text
- **INTEGER**: Whole numbers
- **DATE**: Date without time
- **TIMESTAMP WITH TIME ZONE**: Date and time with timezone
- **BOOLEAN**: True/False values

## Normalization

The database follows **Third Normal Form (3NF)**:

1. **First Normal Form (1NF)**: All columns contain atomic values
2. **Second Normal Form (2NF)**: All non-key attributes are fully dependent on the primary key
3. **Third Normal Form (3NF)**: No transitive dependencies

## Performance Considerations

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Foreign Keys**: Indexed for faster joins
3. **Data Types**: Appropriate types to minimize storage
4. **Normalization**: Reduces data redundancy
5. **Query Optimization**: Efficient join paths

## Security Considerations

1. **Passwords**: Hashed using Bcrypt (not stored in database)
2. **Audit Trail**: All modifications tracked
3. **Access Control**: Role-based permissions enforced at API level
4. **Data Integrity**: Foreign key constraints prevent orphaned records
5. **Timestamps**: All records track creation and update times
