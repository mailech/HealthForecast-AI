const mongoose = require("mongoose");

const accessRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Applicant name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Hospital email address is required"],
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      default: "Clinical Care",
    },
    requestedRole: {
      type: String,
      default: "DOCTOR",
    },
    role: {
      type: String,
      default: "DOCTOR",
    },
    reason: {
      type: String,
      required: [true, "Clinical justification reason is required"],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AccessRequest", accessRequestSchema);
