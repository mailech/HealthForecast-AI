const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const AuditLog = require('../models/AuditLog');
const { parseDiabeticDataset, getDatasetPath } = require('./diabeticDataParser');
const { calculateReadmissionRisk } = require('../services/aiPredictionService');

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

    // 2. Create Patients (From diabetic_data.csv if available, otherwise fallback)
    let patientRecords = [];
    const csvPath = getDatasetPath();

    if (csvPath) {
      const seedLimit = parseInt(process.env.SEED_LIMIT, 10) || 200;
      console.log(`Loading and parsing diabetic data from: ${csvPath} (limit: ${seedLimit})...`);
      try {
        patientRecords = await parseDiabeticDataset({
          limit: seedLimit,
          doctorIds: doctors.map(d => d._id)
        });
        console.log(`Parsed ${patientRecords.length} records from diabetic dataset.`);
      } catch (parseErr) {
        console.warn('Failed parsing diabetic_data.csv, falling back to default records:', parseErr.message);
      }
    }

    if (!patientRecords || patientRecords.length === 0) {
      console.log('Using default sample patients...');
      patientRecords = [
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
              a1cResult: '>8',
              changeInMeds: false,
              diabetesMed: true,
              dischargeDisposition: 'Discharged to Home',
              admissionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
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
        }
      ];
    }

    const seededPatients = await Patient.create(patientRecords);
    console.log(`${seededPatients.length} Patients seeded.`);

    // 3. Create initial predictions history using AI Risk Assessment
    const predictionCandidates = seededPatients.slice(0, Math.min(seededPatients.length, 35));
    const predictions = predictionCandidates.map(patient => {
      const risk = calculateReadmissionRisk(patient);
      return {
        patient: patient._id,
        runBy: patient.assignedDoctor || doctors[0]._id,
        riskScore: risk.riskScore,
        riskCategory: risk.riskCategory,
        readmissionProbability: risk.readmissionProbability,
        keyContributors: risk.keyContributors,
        recommendations: risk.recommendations,
        dischargeSupport: risk.dischargeSupport,
        clinicalFeedback: patient.isReadmitted ? 'Automated high-risk readmission protocol triggered.' : ''
      };
    });

    await Prediction.create(predictions);
    console.log(`${predictions.length} Predictions seeded.`);

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
