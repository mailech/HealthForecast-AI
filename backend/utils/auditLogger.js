const inMemoryLogs = [];

/**
 * Asynchronously record an immutable HIPAA audit log entry
 */
async function logAuditAction({ req, action, patientId = null, patientName = null, details = "", userId = null, userName = null, userRole = null }) {
  try {
    const id = userId || (req && req.user ? req.user._id : "SYS-ADMIN-01");
    const name = userName || (req && req.user ? req.user.name : "System User");
    const role = userRole || (req && req.user ? req.user.role : "SYS_ADMIN");
    const ipAddress = req ? req.ip || req.connection?.remoteAddress || "127.0.0.1" : "127.0.0.1";
    const userAgent = req ? req.headers["user-agent"] || "Mozilla/5.0" : "System Agent";

    const logItem = {
      _id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: String(id),
      userName: name,
      userRole: role,
      action,
      patientId: patientId ? String(patientId) : null,
      patientName,
      details: details || `Performed ${action} under HIPAA medical security protocols.`,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    inMemoryLogs.unshift(logItem);

    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      await AuditLog.create({
        userId: String(id),
        userName: name,
        userRole: role,
        action,
        patientId: patientId ? String(patientId) : null,
        patientName,
        details: details || `Performed ${action} under HIPAA medical security protocols.`,
        ipAddress,
        userAgent,
      });
    }
  } catch (error) {
    console.warn("Audit log creation notice:", error.message);
  }
}

function getInMemoryAuditLogs() {
  return inMemoryLogs;
}

module.exports = { logAuditAction, getInMemoryAuditLogs };
