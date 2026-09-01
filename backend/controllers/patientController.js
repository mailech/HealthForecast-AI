const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Anonymize helper for Healthcare Researchers
const anonymizePatient = (patient) => {
  const obj = patient.toObject ? patient.toObject() : patient;
  return {
    _id: obj._id,
    patientId: obj.patientId,
    firstName: 'ANONYMIZED',
    lastName: 'PATIENT',
    ageGroup: obj.ageGroup,
    gender: obj.gender,
    race: obj.race,
    // Doctor reference is fine, but remove personal info
    assignedDoctor: obj.assignedDoctor,
    isReadmitted: obj.isReadmitted,
    readmissionTime: obj.readmissionTime,
    admissionHistory: (obj.admissionHistory || []).map(adm => ({
      admissionId: adm.admissionId,
      admissionSource: adm.admissionSource,
      timeInHospital: adm.timeInHospital,
      numLabProcedures: adm.numLabProcedures,
      numMedications: adm.numMedications,
      numDiagnoses: adm.numDiagnoses,
      primaryDiagnosis: adm.primaryDiagnosis,
      secondaryDiagnosis: adm.secondaryDiagnosis,
      maxGluSerum: adm.maxGluSerum,
      a1cResult: adm.a1cResult,
      changeInMeds: adm.changeInMeds,
      diabetesMed: adm.diabetesMed,
      admissionDate: adm.admissionDate,
      dischargeDate: adm.dischargeDate,
      dischargeDisposition: adm.dischargeDisposition
    })),
    medicalHistory: {
      chronicConditions: (obj.medicalHistory || {}).chronicConditions || [],
      allergies: ['ANONYMIZED'] // Strip allergies as they can sometimes contain specific personal notes or details
    },
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (All roles)
exports.getPatients = asyncHandler(async (req, res, next) => {
  const role = req.user.role;
  let patients;

  if (role === 'doctor') {
    // Doctors only see their assigned patients
    patients = await Patient.find({ assignedDoctor: req.user._id }).populate('assignedDoctor', 'name specialty');
  } else if (role === 'system_admin' || role === 'hospital_admin' || role === 'researcher') {
    // Admins and researchers see all patients
    patients = await Patient.find({}).populate('assignedDoctor', 'name specialty');
  }

  // If researcher, apply anonymization
  if (role === 'researcher') {
    patients = patients.map(p => anonymizePatient(p));
  }

  res.status(200).json({
    success: true,
    count: patients.length,
    data: patients
  });
});

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private (All roles)
exports.getPatientById = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id).populate('assignedDoctor', 'name specialty');

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  const role = req.user.role;

  // Enforce doctor assigned scoping
  if (role === 'doctor' && patient.assignedDoctor && patient.assignedDoctor._id.toString() !== req.user._id.toString()) {
    // Audit breach attempt
    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      action: 'UNAUTHORIZED_PATIENT_ACCESS_ATTEMPT',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Doctor attempted to access unassigned patient ${patient.patientId} (${patient._id})`
    });

    return res.status(403).json({
      success: false,
      error: 'Access denied: Patient is not assigned to you'
    });
  }

  // Anonymize for researcher
  if (role === 'researcher') {
    return res.status(200).json({
      success: true,
      data: anonymizePatient(patient)
    });
  }

  res.status(200).json({
    success: true,
    data: patient
  });
});

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (Doctor, System Admin)
exports.createPatient = asyncHandler(async (req, res, next) => {
  const role = req.user.role;

  if (role !== 'doctor' && role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to create patient records'
    });
  }

  // If doctor is creating, default assigned doctor to themselves
  const patientData = { ...req.body };
  if (role === 'doctor') {
    patientData.assignedDoctor = req.user._id;
  }

  const patient = await Patient.create(patientData);

  // Audit action
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'PATIENT_CREATED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Created patient record ${patient.patientId} (${patient._id})`
  });

  res.status(201).json({
    success: true,
    data: patient
  });
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Doctor, System Admin)
exports.updatePatient = asyncHandler(async (req, res, next) => {
  let patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  const role = req.user.role;

  if (role !== 'doctor' && role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update patient records'
    });
  }

  // Check doctor assigned scope
  if (role === 'doctor' && patient.assignedDoctor && patient.assignedDoctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Patient is not assigned to you'
    });
  }

  // Update
  patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Audit update
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'PATIENT_UPDATED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Updated patient record ${patient.patientId} (${patient._id})`
  });

  res.status(200).json({
    success: true,
    data: patient
  });
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (System Admin)
exports.deletePatient = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  // Only system admin is allowed to delete
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete patient records'
    });
  }

  await patient.deleteOne();

  // Audit deletion
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'PATIENT_DELETED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Deleted patient record ${patient.patientId} (${patient._id})`
  });

  res.status(200).json({
    success: true,
    message: 'Patient record deleted successfully'
  });
});
