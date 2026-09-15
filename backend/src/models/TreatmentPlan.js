const mongoose = require("mongoose");

const treatmentPlanSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor ID is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis / Condition is required"],
      trim: true,
    },
    goals: [
      {
        type: String,
        trim: true,
      },
    ],
    medications: [
      {
        name: { type: String, trim: true },
        dosage: { type: String, trim: true },
        frequency: { type: String, trim: true },
      },
    ],
    interventions: [
      {
        type: String,
        trim: true,
      },
    ],
    recommendations: [
      {
        type: String,
        trim: true,
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },
    adherence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    outcome: {
      type: String,
      enum: ["PENDING", "IMPROVED", "STABLE", "DETERIORATED", "READMITTED"],
      default: "PENDING",
    },
    outcomeNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TreatmentPlan", treatmentPlanSchema);
