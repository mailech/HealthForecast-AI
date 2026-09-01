const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    runBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskCategory: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    readmissionProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    keyContributors: [
      {
        feature: { type: String, required: true },
        impact: { type: String, enum: ['Positive', 'Negative'], required: true },
        details: { type: String, required: true }
      }
    ],
    recommendations: [
      {
        type: String
      }
    ],
    dischargeSupport: {
      type: String,
      default: ''
    },
    clinicalFeedback: {
      type: String,
      default: '' // Doctor can submit review comments on predictions
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Prediction', predictionSchema);
