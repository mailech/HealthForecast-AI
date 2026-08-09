const AuditLog = require("../models/AuditLog");

// @desc    Get immutable HIPAA Audit Trail logs
// @route   GET /api/audit-logs
// @access  Protected (Admin, Doctor)
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const actionFilter = req.query.action;

    let query = {};
    if (actionFilter && actionFilter !== "All") {
      query.action = actionFilter;
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
