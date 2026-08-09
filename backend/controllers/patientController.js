const Patient = require("../models/Patient");
const { logAuditAction } = require("../utils/auditLogger");

// @desc    Get all patients with pagination, sorting, text search, and soft-delete filtering
// @route   GET /api/patients
// @access  Public / Protected
const getPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const search = req.query.search || "";
    const risk = req.query.risk || "";
    const status = req.query.status || "";
    const includeDeleted = req.query.includeDeleted === "true";

    let query = {};

    if (!includeDeleted) {
      query.isDeleted = false;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (risk && risk !== "All") {
      query.risk = risk;
    }
    if (status && status !== "All") {
      query.status = status;
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient by ID with HIPAA audit log trigger
// @route   GET /api/patients/:id
// @access  Public / Protected
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient record not found");
    }

    // Record HIPAA Audit log entry for viewing PHI
    logAuditAction({
      req,
      action: "VIEW_PATIENT",
      patientId: patient._id,
      patientName: patient.name,
      details: `Viewed patient medical record for ${patient.name}`,
    });

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient record with HIPAA audit log trigger
// @route   POST /api/patients
// @access  Public / Protected
const createPatient = async (req, res, next) => {
  try {
    const { name, age, disease, risk, status, photo, vitals, nationalId, medicalHistoryNotes } = req.body;

    const patient = await Patient.create({
      name,
      age,
      disease,
      risk: risk || "Low",
      status: status || "Active",
      photo: photo || "https://i.pravatar.cc/150",
      vitals: vitals || {},
      nationalId: nationalId || "PHI-SECURE-ID-99482",
      medicalHistoryNotes: medicalHistoryNotes || "Patient registered under clinical intake protocol.",
    });

    // Record HIPAA Audit log entry for creating PHI record
    logAuditAction({
      req,
      action: "CREATE_PATIENT",
      patientId: patient._id,
      patientName: patient.name,
      details: `Registered new patient record for ${patient.name}`,
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient details with HIPAA audit log trigger
// @route   PUT /api/patients/:id
// @access  Public / Protected
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient record not found");
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Record HIPAA Audit log entry
    logAuditAction({
      req,
      action: "UPDATE_PATIENT",
      patientId: updatedPatient._id,
      patientName: updatedPatient.name,
      details: `Updated medical parameters for ${updatedPatient.name}`,
    });

    res.status(200).json({
      success: true,
      message: "Patient record updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete patient record (isDeleted: true) to preserve medical audit trail
// @route   DELETE /api/patients/:id
// @access  Protected (Admin, Doctor)
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!patient) {
      res.status(404);
      throw new Error("Patient record not found or already deleted");
    }

    // Perform soft delete
    patient.isDeleted = true;
    await patient.save();

    // Record HIPAA Audit log entry
    logAuditAction({
      req,
      action: "SOFT_DELETE_PATIENT",
      patientId: patient._id,
      patientName: patient.name,
      details: `Soft-deleted patient record for ${patient.name} (Preserved for compliance audit trail)`,
    });

    res.status(200).json({
      success: true,
      message: "Patient record soft-deleted (preserved for audit trail)",
      data: { id: req.params.id, isDeleted: true },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};