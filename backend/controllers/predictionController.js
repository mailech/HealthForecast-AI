const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const AuditLog = require('../models/AuditLog');
const { calculateReadmissionRisk } = require('../services/aiPredictionService');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Run readmission prediction for a patient
// @route   POST /api/predictions/run/:patientId
// @access  Private (Doctor, System Admin)
exports.runPrediction = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.patientId);

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  const role = req.user.role;

  // Enforce Doctor assignment checks
  if (role === 'doctor' && patient.assignedDoctor && patient.assignedDoctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Patient is not assigned to you'
    });
  }

  // Calculate risk using the simulation engine
  const predictionResults = calculateReadmissionRisk(patient);

  // Save to database
  const prediction = await Prediction.create({
    patient: patient._id,
    runBy: req.user._id,
    riskScore: predictionResults.riskScore,
    riskCategory: predictionResults.riskCategory,
    readmissionProbability: predictionResults.readmissionProbability,
    keyContributors: predictionResults.keyContributors,
    recommendations: predictionResults.recommendations,
    dischargeSupport: predictionResults.dischargeSupport
  });

  // Optional: Update patient's current readmission status for display demo
  // Let's say if predicted probability > 70%, they are flagged
  patient.isReadmitted = predictionResults.riskCategory === 'High';
  patient.readmissionTime = predictionResults.riskCategory === 'High' ? '<30 days' : 'No';
  await patient.save();

  // Audit
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'PREDICTION_RUN',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Ran readmission prediction for patient ${patient.patientId}. Risk Category: ${predictionResults.riskCategory} (${predictionResults.riskScore}%)`
  });

  res.status(201).json({
    success: true,
    data: prediction
  });
});

// @desc    Get prediction history for a patient
// @route   GET /api/predictions/patient/:patientId
// @access  Private (Doctor, Hospital Admin, Researcher, System Admin)
exports.getPredictionHistory = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.patientId);

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  const role = req.user.role;

  // Enforce Doctor assignment scoping
  if (role === 'doctor' && patient.assignedDoctor && patient.assignedDoctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Patient is not assigned to you'
    });
  }

  let predictions = await Prediction.find({ patient: patient._id })
    .populate('runBy', 'name role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: predictions.length,
    data: predictions
  });
});

// @desc    Submit clinical feedback for a prediction
// @route   POST /api/predictions/:id/feedback
// @access  Private (Doctor, System Admin)
exports.submitFeedback = asyncHandler(async (req, res, next) => {
  const { clinicalFeedback } = req.body;

  if (!clinicalFeedback) {
    return res.status(400).json({ success: false, error: 'Feedback content is required' });
  }

  let prediction = await Prediction.findById(req.params.id).populate('patient');

  if (!prediction) {
    return res.status(404).json({ success: false, error: 'Prediction record not found' });
  }

  const role = req.user.role;

  // Enforce doctor assigned checks
  if (role === 'doctor' && prediction.patient.assignedDoctor && prediction.patient.assignedDoctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Patient is not assigned to you'
    });
  }

  prediction.clinicalFeedback = clinicalFeedback;
  await prediction.save();

  // Audit
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'PREDICTION_FEEDBACK_SUBMITTED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Doctor submitted clinical feedback for prediction ${prediction._id}`
  });

  res.status(200).json({
    success: true,
    data: prediction
  });
});
