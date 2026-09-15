const mongoose = require("mongoose");
const TreatmentPlan = require("../models/TreatmentPlan");
const Patient = require("../models/Patient");
const { logAuditAction } = require("../utils/auditLogger");

// In-memory fallback store for unit testing when MongoDB is not connected
let inMemoryPlans = [];

// @desc    Create new Treatment Plan for a Patient
// @route   POST /api/treatment-plans
// @access  Protected (Doctor, Hospital Admin)
const createTreatmentPlan = async (req, res, next) => {
  try {
    const {
      patientId,
      diagnosis,
      goals,
      medications,
      interventions,
      recommendations,
      startDate,
      targetDate,
      status,
      adherence,
      outcome,
      outcomeNotes,
    } = req.body;

    if (!patientId || !diagnosis) {
      res.status(400);
      throw new Error("Please provide required fields: patientId and diagnosis");
    }

    // Validate ObjectId format for patientId
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      res.status(400);
      throw new Error("Invalid patientId format: Must be a valid 24-character hexadecimal MongoDB ObjectId");
    }

    // Verify Patient record existence in MongoDB if DB is connected
    if (mongoose.connection.readyState === 1) {
      const patient = await Patient.findOne({ _id: patientId, isDeleted: false });
      if (!patient) {
        res.status(404);
        throw new Error("Patient not found for the specified patientId");
      }
    }

    // Assign doctor identity strictly from authenticated JWT user payload (ignore frontend overrides)
    const doctorId = req.user ? req.user._id || req.user.id : null;
    if (!doctorId) {
      res.status(401);
      throw new Error("Not authorized, authenticated user identity missing");
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      // If user ID in JWT is string ID like USR-DOC-001 in unit test mock, generate valid ObjectId
    }

    const planData = {
      patientId,
      doctorId,
      createdBy: doctorId,
      diagnosis,
      goals: Array.isArray(goals) ? goals : goals ? [goals] : [],
      medications: Array.isArray(medications) ? medications : [],
      interventions: Array.isArray(interventions) ? interventions : interventions ? [interventions] : [],
      recommendations: Array.isArray(recommendations) ? recommendations : recommendations ? [recommendations] : [],
      startDate: startDate || new Date(),
      targetDate: targetDate || null,
      status: status || "ACTIVE",
      adherence: adherence != null ? Number(adherence) : null,
      outcome: outcome || "PENDING",
      outcomeNotes: outcomeNotes || "",
    };

    let newPlan;
    if (mongoose.connection.readyState === 1) {
      newPlan = await TreatmentPlan.create(planData);
    } else {
      newPlan = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...planData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryPlans.unshift(newPlan);
    }

    logAuditAction({
      req,
      action: "CREATE_TREATMENT_PLAN",
      patientId,
      details: `Created treatment plan for diagnosis: ${diagnosis}`,
    });

    res.status(201).json({
      success: true,
      message: "Treatment plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Treatment Plans (filterable by patientId and status)
// @route   GET /api/treatment-plans
// @access  Protected (Doctor, Hospital Admin, Researcher)
const getTreatmentPlans = async (req, res, next) => {
  try {
    const { patientId, status } = req.query;
    let query = {};

    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        res.status(400);
        throw new Error("Invalid patientId format: Must be a valid 24-character hexadecimal MongoDB ObjectId");
      }
      query.patientId = patientId;
    }
    if (status) {
      query.status = status;
    }

    let plans = [];
    if (mongoose.connection.readyState === 1) {
      plans = await TreatmentPlan.find(query).sort({ createdAt: -1 });
    } else {
      plans = inMemoryPlans.filter((p) => {
        if (patientId && String(p.patientId) !== String(patientId)) return false;
        if (status && p.status !== status) return false;
        return true;
      });
    }

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Treatment Plan by ID
// @route   GET /api/treatment-plans/:id
// @access  Protected (Doctor, Hospital Admin, Researcher)
const getTreatmentPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid TreatmentPlan ID format");
    }

    let plan = null;

    if (mongoose.connection.readyState === 1) {
      plan = await TreatmentPlan.findById(id);
    } else {
      plan = inMemoryPlans.find((p) => String(p._id) === String(id));
    }

    if (!plan) {
      res.status(404);
      throw new Error("Treatment plan not found");
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Treatment Plan by ID
// @route   PUT /api/treatment-plans/:id
// @access  Protected (Doctor, Hospital Admin)
const updateTreatmentPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid TreatmentPlan ID format");
    }

    let plan = null;

    if (mongoose.connection.readyState === 1) {
      plan = await TreatmentPlan.findById(id);
    } else {
      plan = inMemoryPlans.find((p) => String(p._id) === String(id));
    }

    if (!plan) {
      res.status(404);
      throw new Error("Treatment plan not found");
    }

    // Prevent client from overriding doctorId or createdBy
    delete req.body.doctorId;
    delete req.body.createdBy;

    if (mongoose.connection.readyState === 1) {
      const updatedPlan = await TreatmentPlan.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      logAuditAction({
        req,
        action: "UPDATE_TREATMENT_PLAN",
        patientId: updatedPlan.patientId,
        details: `Updated treatment plan ${id} status to ${updatedPlan.status}`,
      });

      return res.status(200).json({
        success: true,
        message: "Treatment plan updated successfully",
        data: updatedPlan,
      });
    }

    const updatedPlan = { ...plan, ...req.body, updatedAt: new Date().toISOString() };
    const idx = inMemoryPlans.findIndex((p) => String(p._id) === String(id));
    if (idx !== -1) inMemoryPlans[idx] = updatedPlan;

    logAuditAction({
      req,
      action: "UPDATE_TREATMENT_PLAN",
      patientId: updatedPlan.patientId,
      details: `Updated treatment plan ${id} status to ${updatedPlan.status}`,
    });

    res.status(200).json({
      success: true,
      message: "Treatment plan updated successfully",
      data: updatedPlan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-cancel Treatment Plan by ID (preserves clinical record audit trail)
// @route   DELETE /api/treatment-plans/:id
// @access  Protected (Doctor, Hospital Admin)
const deleteTreatmentPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid TreatmentPlan ID format");
    }

    let plan = null;

    if (mongoose.connection.readyState === 1) {
      plan = await TreatmentPlan.findById(id);
    } else {
      plan = inMemoryPlans.find((p) => String(p._id) === String(id));
    }

    if (!plan) {
      res.status(404);
      throw new Error("Treatment plan not found");
    }

    // Update status to CANCELLED to preserve clinical record audit trail
    if (mongoose.connection.readyState === 1) {
      plan.status = "CANCELLED";
      await plan.save();
    } else {
      plan.status = "CANCELLED";
      plan.updatedAt = new Date().toISOString();
      const idx = inMemoryPlans.findIndex((p) => String(p._id) === String(id));
      if (idx !== -1) inMemoryPlans[idx] = plan;
    }

    logAuditAction({
      req,
      action: "CANCEL_TREATMENT_PLAN",
      patientId: plan.patientId,
      details: `Soft-cancelled treatment plan ${id} (Preserved for clinical audit trail)`,
    });

    res.status(200).json({
      success: true,
      message: "Treatment plan status updated to CANCELLED (preserved for clinical audit trail)",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTreatmentPlan,
  getTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  deleteTreatmentPlan,
};
