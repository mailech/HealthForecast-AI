const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionId: {
    type: String,
    required: true,
    default: () => 'ADM-' + Math.floor(100000 + Math.random() * 900000)
  },
  admissionSource: {
    type: String,
    default: 'Emergency Room'
  },
  timeInHospital: {
    type: Number,
    required: true, // in days
    default: 3
  },
  numLabProcedures: {
    type: Number,
    required: true,
    default: 10
  },
  numMedications: {
    type: Number,
    required: true,
    default: 5
  },
  numDiagnoses: {
    type: Number,
    required: true,
    default: 2
  },
  primaryDiagnosis: {
    type: String,
    required: true,
    default: 'Diabetes'
  },
  secondaryDiagnosis: {
    type: String,
    default: 'Hypertension'
  },
  maxGluSerum: {
    type: String,
    enum: ['None', '>200', '>300', 'Norm'],
    default: 'None'
  },
  a1cResult: {
    type: String,
    enum: ['None', '>7', '>8', 'Norm'],
    default: 'None'
  },
  changeInMeds: {
    type: Boolean,
    default: false
  },
  diabetesMed: {
    type: Boolean,
    default: false
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  dischargeDate: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Default 3 days later
  },
  dischargeDisposition: {
    type: String,
    default: 'Discharged to Home'
  }
});

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      default: () => 'PT-' + Math.floor(10000 + Math.random() * 90000)
    },
    firstName: {
      type: String,
      required: [true, 'Please add first name'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Please add last name'],
      trim: true
    },
    ageGroup: {
      type: String,
      required: true, // e.g. "50-60", "70-80"
      default: '50-60'
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    race: {
      type: String,
      default: 'Caucasian'
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    admissionHistory: [admissionSchema],
    medicalHistory: {
      allergies: [String],
      chronicConditions: [String]
    },
    isReadmitted: {
      type: Boolean,
      default: false
    },
    readmissionTime: {
      type: String,
      enum: ['<30 days', '>30 days', 'No'],
      default: 'No'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for fullname (not stored in db, but available on retrieval)
patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Patient', patientSchema);
