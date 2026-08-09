const AuditLog = require("../models/AuditLog");

/**
 * Asynchronously record an immutable HIPAA audit log entry
 */
async function logAuditAction({ req, action, patientId = null, patientName = null, details = "" }) {
  try {
    const userId = req && req.user ? req.user._id : "DOC-88492";
    const userName = req && req.user ? req.user.name : "Dr. Alex Morgan";
    const userRole = req && req.user ? req.user.role : "Doctor";
    const ipAddress = req ? req.ip || req.connection?.remoteAddress || "127.0.0.1" : "127.0.0.1";
    const userAgent = req ? req.headers["user-agent"] || "Mozilla/5.0" : "System Agent";

    await AuditLog.create({
      userId: String(userId),
      userName,
      userRole,
      action,
      patientId: patientId ? String(patientId) : null,
      patientName,
      details: details || `Performed ${action} under HIPAA medical security protocols.`,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to record HIPAA audit log:", error.message);
  }
}

module.exports = { logAuditAction };
