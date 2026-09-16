const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const AuditLog = require('../models/AuditLog');
const { calculateReadmissionRisk } = require('../services/aiPredictionService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { maskPiiRecursively } = require('../middleware/privacyMiddleware');

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

  // Calculate risk: Query FastAPI in-memory model service first, fallback to local engine
  let predictionResults = null;
  const FASTAPI_URL = process.env.FASTAPI_INFERENCE_URL || 'http://127.0.0.1:8000';

  try {
    const admissions = patient.admissionHistory || [];
    const adm = admissions.length > 0 ? admissions[admissions.length - 1] : {};

    const response = await fetch(`${FASTAPI_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patient.patientId,
        time_in_hospital: adm.timeInHospital || 3,
        num_lab_procedures: adm.numLabProcedures || 20,
        num_procedures: 1,
        num_medications: adm.numMedications || 10,
        number_outpatient: 0,
        number_emergency: 0,
        number_inpatient: Math.max(0, admissions.length - 1),
        number_diagnoses: adm.numDiagnoses || 4,
        age_group: patient.ageGroup || '50-60',
        race: patient.race || 'Caucasian',
        gender: patient.gender || 'Female',
        weight: adm.weight || 75.0,
        weight_was_missing: adm.weightWasMissing !== undefined ? adm.weightWasMissing : true,
        payer_code: adm.payerCode || 'MC',
        medical_specialty: adm.medicalSpecialty || 'InternalMedicine',
        primary_diagnosis: adm.primaryDiagnosis || 'Diabetes Mellitus',
        secondary_diagnosis: adm.secondaryDiagnosis || 'Hypertension',
        max_glu_serum: adm.maxGluSerum || 'None',
        a1c_result: adm.a1cResult || 'None',
        change_in_meds: !!adm.changeInMeds,
        diabetes_med: !!adm.diabetesMed
      }),
      signal: AbortSignal.timeout(1500)
    });

    if (response.ok) {
      const fastApiData = await response.json();
      predictionResults = {
        riskScore: fastApiData.risk_score,
        riskCategory: fastApiData.risk_category,
        readmissionProbability: fastApiData.readmission_probability,
        keyContributors: fastApiData.key_contributors,
        recommendations: fastApiData.recommendations,
        dischargeSupport: fastApiData.discharge_support
      };
    }
  } catch (err) {
    // Graceful fallback to embedded clinical engine
  }

  if (!predictionResults) {
    predictionResults = calculateReadmissionRisk(patient);
  }

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

  // Strictly sanitize & mask PII for Healthcare Researcher role
  if (role === 'researcher') {
    predictions = maskPiiRecursively(predictions);
  }

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

// @desc    Get all predictions (scoped to doctor assigned patients or all for admins)
// @route   GET /api/predictions
// @access  Private (Doctor, Hospital Admin, Researcher, System Admin)
exports.getPredictions = asyncHandler(async (req, res, next) => {
  const role = req.user.role;
  let filter = {};

  if (role === 'doctor') {
    const patientIds = await Patient.find({ assignedDoctor: req.user._id }).distinct('_id');
    filter = { patient: { $in: patientIds } };
  }

  let predictions = await Prediction.find(filter)
    .populate('patient', 'patientId firstName lastName ageGroup gender race admissionHistory isReadmitted readmissionTime')
    .populate('runBy', 'name role')
    .sort({ createdAt: -1 });

  if (role === 'researcher') {
    predictions = maskPiiRecursively(predictions);
  }

  res.status(200).json({
    success: true,
    count: predictions.length,
    data: predictions
  });
});

