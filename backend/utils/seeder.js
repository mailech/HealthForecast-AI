const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const AuditLog = require('../models/AuditLog');

dotenv.config();

// Connect to DB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management';

const defaultDoctors = [
  {
    name: 'Dr. Ruchika Patil',
    email: 'doctor@healthforecast.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Endocrinology'
  },
  {
    name: 'Dr. Gregory House',
    email: 'doctor2@healthforecast.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Diagnostic Medicine'
  }
];

const defaultOtherUsers = [
  {
    name: 'Sanika Walunj',
    email: 'admin@healthforecast.com',
    password: 'password123',
    role: 'hospital_admin'
  },
  {
    name: 'Tirtha Patil',
    email: 'researcher@healthforecast.com',
    password: 'password123',
    role: 'researcher'
  },
  {
    name: 'Avik Patil',
    email: 'sysadmin@healthforecast.com',
    password: 'password123',
    role: 'system_admin'
  }
];

const seedData = async () => {
  try {
    if (require.main === module) {
      await mongoose.connect(mongoURI);
      console.log('Database Connected for seeding...');
    }

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Prediction.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Database cleared.');

    // 1. Create Users (Doctor passwords will be hashed by pre-save hooks)
    const doctors = await User.create(defaultDoctors);
    console.log('Doctors seeded.');

    const otherUsers = await User.create(defaultOtherUsers);
    console.log('Admin, Researcher, and SysAdmin seeded.');

    // 2. Create Patients with diabetes dataset properties
    const patientRecords = [
      {
        firstName: 'John',
        lastName: 'Doe',
        ageGroup: '70-80',
        gender: 'Male',
        race: 'Caucasian',
        assignedDoctor: doctors[0]._id,
        medicalHistory: {
          allergies: ['Penicillin', 'Sulfa'],
          chronicConditions: ['Type 2 Diabetes', 'Hypertension', 'Chronic Kidney Disease']
        },
        admissionHistory: [
          {
            admissionSource: 'Emergency Room',
            timeInHospital: 7,
            numLabProcedures: 64,
            numMedications: 28,
            numDiagnoses: 9,
            primaryDiagnosis: 'Diabetes Mellitus (ICD9-250)',
            secondaryDiagnosis: 'Congestive Heart Failure',
            maxGluSerum: 'None',
            a1cResult: '>8', // High
            changeInMeds: false, // No med change - Risk!
            diabetesMed: true,
            dischargeDisposition: 'Discharged to Home',
            admissionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          {
            admissionSource: 'Referral',
            timeInHospital: 9,
            numLabProcedures: 72,
            numMedications: 31,
            numDiagnoses: 9,
            primaryDiagnosis: 'Diabetic Ketoacidosis',
            secondaryDiagnosis: 'Renal Insufficiency',
            maxGluSerum: 'None',
            a1cResult: '>8', // High
            changeInMeds: false, // Risk factor
            diabetesMed: true,
            dischargeDisposition: 'Discharged to Rehab', // Risk factor
            admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ],
        isReadmitted: true,
        readmissionTime: '<30 days'
      },
      {
        firstName: 'Emma',
        lastName: 'Watson',
        ageGroup: '30-40',
        gender: 'Female',
        race: 'Caucasian',
        assignedDoctor: doctors[0]._id,
        medicalHistory: {
          allergies: [],
          chronicConditions: ['Asthma']
        },
        admissionHistory: [
          {
            admissionSource: 'Clinic Referral',
            timeInHospital: 2,
            numLabProcedures: 18,
            numMedications: 9,
            numDiagnoses: 2,
            primaryDiagnosis: 'Acute Asthma Exacerbation',
            secondaryDiagnosis: 'Allergic Rhinitis',
            maxGluSerum: 'None',
            a1cResult: 'None',
            changeInMeds: true,
            diabetesMed: false,
            dischargeDisposition: 'Discharged to Home',
            admissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          }
        ],
        isReadmitted: false,
        readmissionTime: 'No'
      },
      {
        firstName: 'Robert',
        lastName: 'Downey',
        ageGroup: '50-60',
        gender: 'Male',
        race: 'African American',
        assignedDoctor: doctors[1]._id,
        medicalHistory: {
          allergies: ['Aspirin'],
          chronicConditions: ['Type 2 Diabetes', 'Hyperlipidemia']
        },
        admissionHistory: [
          {
            admissionSource: 'Emergency Room',
            timeInHospital: 4,
            numLabProcedures: 48,
            numMedications: 16,
            numDiagnoses: 4,
            primaryDiagnosis: 'Cellulitis',
            secondaryDiagnosis: 'Diabetes Mellitus',
            maxGluSerum: 'Norm',
            a1cResult: '>7',
            changeInMeds: true, // Controlled modification
            diabetesMed: true,
            dischargeDisposition: 'Discharged to Home',
            admissionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
          }
        ],
        isReadmitted: false,
        readmissionTime: 'No'
      },
      {
        firstName: 'Serena',
        lastName: 'Williams',
        ageGroup: '60-70',
        gender: 'Female',
        race: 'African American',
        assignedDoctor: doctors[1]._id,
        medicalHistory: {
          allergies: ['Contrast Dye'],
          chronicConditions: ['Hypertension', 'Obesity', 'Sleep Apnea']
        },
        admissionHistory: [
          {
            admissionSource: 'Emergency Room',
            timeInHospital: 8,
            numLabProcedures: 58,
            numMedications: 24,
            numDiagnoses: 7,
            primaryDiagnosis: 'Ischemic Stroke',
            secondaryDiagnosis: 'Hypertensive Heart Disease',
            maxGluSerum: 'None',
            a1cResult: 'None',
            changeInMeds: false,
            diabetesMed: false,
            dischargeDisposition: 'Discharged to Home Care',
            admissionDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
          }
        ],
        isReadmitted: true,
        readmissionTime: '>30 days'
      },
      {
        firstName: 'Keanu',
        lastName: 'Reeves',
        ageGroup: '40-50',
        gender: 'Male',
        race: 'Asian',
        assignedDoctor: doctors[0]._id,
        medicalHistory: {
          allergies: [],
          chronicConditions: ['Gout']
        },
        admissionHistory: [
          {
            admissionSource: 'Referral',
            timeInHospital: 3,
            numLabProcedures: 32,
            numMedications: 12,
            numDiagnoses: 3,
            primaryDiagnosis: 'Acute Gouty Arthritis',
            secondaryDiagnosis: 'Hyperuricemia',
            maxGluSerum: 'None',
            a1cResult: 'Norm',
            changeInMeds: false,
            diabetesMed: false,
            dischargeDisposition: 'Discharged to Home',
            admissionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          }
        ],
        isReadmitted: false,
        readmissionTime: 'No'
      }
    ];

    const seededPatients = await Patient.create(patientRecords);
    console.log('Patients seeded.');

    // 3. Create initial predictions history
    const predictions = [
      {
        patient: seededPatients[0]._id,
        runBy: doctors[0]._id,
        riskScore: 88,
        riskCategory: 'High',
        readmissionProbability: 88,
        keyContributors: [
          {
            feature: 'Prior Admissions',
            impact: 'Positive',
            details: 'Patient has had 2 previous admissions, which strongly correlates with chronic instability.'
          },
          {
            feature: 'Uncontrolled HbA1c',
            impact: 'Positive',
            details: 'Elevated HbA1c level (>8) with no subsequent changes in medication regimens.'
          },
          {
            feature: 'Length of Stay',
            impact: 'Positive',
            details: 'Latest hospital stay was prolonged (9 days).'
          }
        ],
        recommendations: [
          'Schedule a clinical check-in or home-health phone call within 48 hours of discharge.',
          'Conduct a comprehensive pharmacist-led medication reconciliation.',
          'Schedule an in-person primary care physician follow-up within 7 days.',
          'Refer the patient to a Certified Diabetes Educator (CDE).'
        ],
        dischargeSupport: 'Transitional care management (TCM) enrollment. Home health care referral recommended.',
        clinicalFeedback: 'Concur. Patient needs immediate diabetic education follow-up.'
      },
      {
        patient: seededPatients[2]._id,
        runBy: doctors[1]._id,
        riskScore: 32,
        riskCategory: 'Low',
        readmissionProbability: 32,
        keyContributors: [
          {
            feature: 'Diabetes Control',
            impact: 'Negative',
            details: 'Active medication management helps mitigate readmission risks.'
          }
        ],
        recommendations: [
          'Ensure standard follow-up appointment is scheduled within 30 days.',
          'Provide standard healthy living and medication instruction packets.'
        ],
        dischargeSupport: 'Standard discharge home.',
        clinicalFeedback: ''
      }
    ];

    await Prediction.create(predictions);
    console.log('Predictions seeded.');

    // 4. Create Audit Logs
    const auditLogs = [
      {
        user: otherUsers[2]._id, // sysadmin
        userEmail: otherUsers[2].email,
        action: 'USER_REGISTERED',
        details: 'Admin user Sarah Connor registered.'
      },
      {
        user: otherUsers[2]._id,
        userEmail: otherUsers[2].email,
        action: 'SYSTEM_INITIALIZED',
        details: 'HealthForecast AI system initial configuration loaded.'
      }
    ];

    await AuditLog.create(auditLogs);
    console.log('Audit logs seeded.');

    console.log('Database Seeding Completed successfully!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding database: ', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
