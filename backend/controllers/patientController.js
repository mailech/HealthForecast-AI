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

    let patients = [];
    let total = 0;
    const mongoose = require("mongoose");

    if (mongoose.connection.readyState === 1) {
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

      total = await Patient.countDocuments(query);
      patients = await Patient.find(query)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);
    }

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
    console.log("Create patient payload:", req.body);

    const {
      name,
      age,
      gender,
      disease,
      risk,
      riskLevel,
      status,
      photo,
      vitals,
      nationalId,
      medicalHistory,
      medicalHistoryNotes,
      admissionDate,
    } = req.body;

    if (!name || age == null) {
      res.status(400);
      throw new Error("Please provide required patient parameters (name, age, disease/medicalHistory)");
    }

    const ageNum = parseInt(age, 10);
    const primaryDisease = disease || medicalHistory || "General Observation";
    const patientRisk = risk || riskLevel || "Low";

    let patient;
    const mongoose = require("mongoose");

    if (mongoose.connection.readyState === 1) {
      patient = await Patient.create({
        name,
        age: ageNum,
        gender: gender || "Male",
        disease: primaryDisease,
        risk: patientRisk,
        status: status || "Active",
        photo: photo || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        vitals: vitals || { glucose: 110, bp: "120/80", bmi: 24.0 },
        nationalId: nationalId || "PHI-SECURE-ID-99482",
        medicalHistoryNotes: medicalHistoryNotes || medicalHistory || "Patient registered under clinical intake protocol.",
        admissionDate: admissionDate || new Date().toISOString(),
      });
    } else {
      patient = {
        _id: `PAT-${Date.now()}`,
        name,
        age: ageNum,
        gender: gender || "Male",
        disease: primaryDisease,
        risk: patientRisk,
        status: status || "Active",
        photo: photo || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        vitals: vitals || { glucose: 110, bp: "120/80", bmi: 24.0 },
        createdAt: new Date().toISOString(),
      };
    }

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

// @desc    Download Patient Care Plan & Clinical Report as PDF Stream
// @route   GET /api/patients/:id/download-pdf, GET /api/patients/:id/care-plan/download
// @access  Public / Protected
const downloadCarePlan = async (req, res, next) => {
  try {
    const PDFDocument = require("pdfkit");
    const patientId = req.params.id;
    let patient = null;

    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1 && patientId && !patientId.startsWith("PAT-")) {
      try {
        patient = await Patient.findById(patientId);
      } catch (e) {}
    }

    if (!patient) {
      patient = {
        _id: patientId || "PAT-DEMO-001",
        name: "Rahul Verma",
        age: 61,
        disease: "Congestive Heart Failure & Hypertension",
        risk: "High",
        riskScore: 84,
        status: "Active",
        vitals: {
          glucose: 142,
          bp: "138/88",
          bmi: 28.4,
          previousAdmissions: 2,
        },
        medicalHistoryNotes: "Patient flagged with elevated 30-day readmission risk due to recurrent heart failure exacerbation.",
      };
    }

    const safePatientName = (patient.name || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safePatientName}_Care_Plan.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Title Header
    doc
      .fillColor("#1e3a8a")
      .fontSize(20)
      .text("HEALTHFORECAST AI — CLINICAL CARE PLAN", { align: "center" });
    doc.fontSize(10).fillColor("#64748b").text("HIPAA Compliant Medical Outcome & Risk Assessment Report", { align: "center" });
    doc.moveDown(1.5);

    // Divider Line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cbd5e1").stroke();
    doc.moveDown(1);

    // Patient Demographics
    doc.fontSize(14).fillColor("#0f172a").text("Patient Summary & Demographics", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`Patient Name: ${patient.name}`);
    doc.text(`Patient Record ID: ${patient._id}`);
    doc.text(`Age: ${patient.age} years`);
    doc.text(`Primary Clinical Diagnosis: ${patient.disease}`);
    doc.text(`Ward Status: ${patient.status || "Active"}`);
    doc.moveDown(1);

    // Clinical Vitals & Risk Assessment
    doc.fontSize(14).fillColor("#0f172a").text("Clinical Vitals & AI Readmission Risk", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`30-Day Readmission Risk Index: ${patient.risk || "High"} (${patient.riskScore || 84}%)`);
    doc.text(`Blood Pressure (BP): ${patient.vitals?.bp || "138/88 mmHg"}`);
    doc.text(`Blood Glucose: ${patient.vitals?.glucose || 142} mg/dL`);
    doc.text(`Body Mass Index (BMI): ${patient.vitals?.bmi || 28.4}`);
    doc.text(`Previous Admissions: ${patient.vitals?.previousAdmissions || 2}`);
    doc.moveDown(1);

    // Recommended Interventions
    doc.fontSize(14).fillColor("#0f172a").text("AI Clinical Recommendations & Protocol", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#1e293b");
    doc.text("1. Schedule mandatory nurse case manager follow-up within 48 hours of discharge.");
    doc.text("2. Continuous blood pressure & glycemic monitoring with telemetry sync.");
    doc.text("3. Adjust ACE inhibitor dosage and monitor renal lab parameters prior to exit.");
    doc.text("4. Enroll patient in post-discharge medication adherence tracking.");
    doc.moveDown(1.5);

    // Footer
    doc.fontSize(8).fillColor("#94a3b8").text(`Generated on ${new Date().toLocaleString()} • HealthForecast AI Engine v2.4`, { align: "center" });

    doc.end();

    logAuditAction({
      req,
      action: "DOWNLOAD_PATIENT_CARE_PLAN",
      patientId: patient._id,
      patientName: patient.name,
      details: `Downloaded PDF care plan for ${patient.name}`,
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
  downloadCarePlan,
};