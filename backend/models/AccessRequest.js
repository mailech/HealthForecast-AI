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
      enum: ["DOCTOR", "HOSPITAL_ADMIN", "RESEARCHER", "SYS_ADMIN"],
      default: "DOCTOR",
    },
    reason: {
      type: String,
      required: [true, "Clinical justification reason is required"],
    },
    status: {
      type: String,
      enum: ["Pending Review", "Approved", "Rejected"],
      default: "Pending Review",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AccessRequest", accessRequestSchema);
