const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "SYSTEM_SYSTEM_USER",
    },
    userName: {
      type: String,
      default: "Dr. Alex Morgan",
    },
    userRole: {
      type: String,
      default: "Doctor",
    },
    action: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      default: null,
    },
    patientName: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      default: "Access granted under HIPAA compliance policy.",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  },
  {
    timestamps: true,
  }
);

// Immutable log collection: prevent updates and soft-deletes
auditLogSchema.pre("save", function (next) {
  if (!this.isNew) {
    return next(new Error("Immutable HIPAA Audit Log cannot be modified after creation"));
  }
  next();
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
