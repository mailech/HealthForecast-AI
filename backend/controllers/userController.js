const User = require("../models/User");
const AccessRequest = require("../models/AccessRequest");
const { logAuditAction } = require("../utils/auditLogger");
const { getIO } = require("../socket");

// @desc    Get all pending user credential requests (isApproved: false OR status: 'Pending')
// @route   GET /api/users/pending
// @access  Public / Private (Admin)
const getPendingRequests = async (req, res, next) => {
  try {
    let requests = [];
    const mongoose = require("mongoose");

    if (mongoose.connection.readyState === 1) {
      const accessRequests = await AccessRequest.find({
        $or: [{ isApproved: false }, { status: "Pending" }, { status: "Pending Review" }],
      }).sort({ createdAt: -1 });

      const pendingUsers = await User.find({
        $or: [{ isApproved: false }, { status: "Pending" }],
      }).select("-password").sort({ createdAt: -1 });

      const combinedMap = new Map();
      accessRequests.forEach((r) => {
        combinedMap.set(r.email, {
          _id: r._id,
          id: r._id,
          name: r.name,
          email: r.email,
          department: r.department,
          requestedRole: r.requestedRole || r.role || "DOCTOR",
          role: r.role || r.requestedRole || "DOCTOR",
          reason: r.reason,
          status: r.status || "Pending",
          isApproved: r.isApproved !== undefined ? r.isApproved : false,
          createdAt: r.createdAt,
        });
      });

      pendingUsers.forEach((u) => {
        if (!combinedMap.has(u.email)) {
          combinedMap.set(u.email, {
            _id: u._id,
            id: u._id,
            name: u.name,
            email: u.email,
            department: u.department || "Clinical Care",
            requestedRole: u.role || "DOCTOR",
            role: u.role || "DOCTOR",
            reason: "User registered - pending admin approval",
            status: u.status || "Pending",
            isApproved: u.isApproved !== undefined ? u.isApproved : false,
            createdAt: u.createdAt,
          });
        }
      });

      requests = Array.from(combinedMap.values());
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public / Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    let users = [];
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      users = await User.find().select("-password").sort({ createdAt: -1 });
    }

    if (!users || users.length === 0) {
      users = [
        { _id: "USR-001", name: "Velam Mounika", email: "mounikavelam@gmail.com", role: "SYS_ADMIN", department: "IT & System Administration", isApproved: true, status: "Active" },
        { _id: "USR-002", name: "Student 23U41A4257", email: "23u41a4257@diet.edu.in", role: "DOCTOR", department: "Cardiology & ICU", isApproved: true, status: "Active" },
        { _id: "USR-003", name: "Super Admin", email: "sysadmin@healthforecast.ai", role: "SYS_ADMIN", department: "IT & Platform Governance", isApproved: true, status: "Active" },
        { _id: "USR-004", name: "Admin Sarah Jenkins", email: "admin@healthforecast.ai", role: "HOSPITAL_ADMIN", department: "Hospital Administration", isApproved: true, status: "Active" },
        { _id: "USR-005", name: "Dr. John Smith", email: "john.smith@healthforecast.ai", role: "DOCTOR", department: "Cardiology", isApproved: true, status: "Active" },
        { _id: "USR-006", name: "Dr. Alan Turing", email: "researcher@healthforecast.ai", role: "RESEARCHER", department: "Population Health & Research", isApproved: true, status: "Active" },
      ];
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingRequests,
  getUsers,
};
