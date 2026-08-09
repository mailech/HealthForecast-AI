const mongoose = require("mongoose");
const { encryptPHI, decryptPHI } = require("../utils/cryptoUtils");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Patient age is required"],
      min: [1, "Age must be at least 1"],
      max: [120, "Age cannot exceed 120"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    disease: {
      type: String,
      required: [true, "Primary condition/disease is required"],
      trim: true,
    },
    risk: {
      type: String,
      enum: ["Low", "Medium", "High", "LOW", "MEDIUM", "HIGH"],
      default: "Low",
    },
    riskScore: {
      type: Number,
      default: 50,
    },
    riskCategory: {
      type: String,
      default: "LOW",
    },
    status: {
      type: String,
      enum: ["Active", "Discharged"],
      default: "Active",
    },
    photo: {
      type: String,
      default: "https://i.pravatar.cc/150",
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    previousAdmissions: {
      type: Number,
      default: 0,
    },
    // Encrypted PHI Fields (AES-256-CBC at rest)
    nationalId: {
      type: String,
      set: encryptPHI,
      get: decryptPHI,
      default: "PHI-SECURE-ID-99482",
    },
    medicalHistoryNotes: {
      type: String,
      set: encryptPHI,
      get: decryptPHI,
      default: "Patient has history of hypertension and glycemic variability.",
    },
    emergencyContact: {
      type: String,
      set: encryptPHI,
      get: decryptPHI,
      default: "+1 (555) 987-6543",
    },
    vitals: {
      glucose: { type: Number, default: 100 },
      bp: { type: String, default: "120/80" },
      bloodPressure: { type: String, default: "120/80" },
      bmi: { type: Number, default: 24.5 },
      previousAdmissions: { type: Number, default: 0 },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
);

// Compound text index for sub-millisecond full-text queries
patientSchema.index({ name: "text", disease: "text" });

module.exports = mongoose.model("Patient", patientSchema);