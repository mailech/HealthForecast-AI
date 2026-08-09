const User = require("../models/User");
const AccessRequest = require("../models/AccessRequest");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "healthforecast_secret_jwt_key_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "healthforecast_refresh_secret_key_2026";

// Generate Access Token (15m expiration)
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "15m" });
};

// Generate Refresh Token (7d expiration)
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// @desc    Register new doctor/user account
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please fill in all required fields (name, email, password)");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this email address");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Doctor",
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Account registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get JWT tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "Clinical Care",
      twoFactorEnabled: user.twoFactorEnabled,
    };

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      token: accessToken,
      user: userData,
      data: {
        ...userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token using Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400);
      throw new Error("Refresh token required");
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401);
      throw new Error("Invalid or expired refresh token");
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401);
    next(new Error("Refresh token verification failed"));
  }
};

// @desc    Validate 2FA Token Code
// @route   POST /api/auth/2fa/validate
// @access  Private
const validate2FAToken = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code || code.length !== 6) {
      res.status(400);
      throw new Error("Invalid 2FA code format. 6-digit code required.");
    }

    // Simulated 2FA verification logic
    if (code === "123456" || code === "654321") {
      res.status(200).json({
        success: true,
        message: "2FA authentication verified successfully",
        twoFactorVerified: true,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Incorrect 2FA code provided",
        twoFactorVerified: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Authenticated User Profile
// @route   GET /api/auth/me
// @access  Private
const getMeProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit hospital staff credential request
// @route   POST /api/auth/request-credentials
// @access  Public
const requestCredentials = async (req, res, next) => {
  try {
    const { name, email, department, requestedRole, reason } = req.body;

    if (!name || !email || !reason) {
      res.status(400);
      throw new Error("Please complete all required fields (name, email, reason)");
    }

    // Save access request record to database (or simulate if DB offline)
    let accessReq;
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      try {
        accessReq = await AccessRequest.create({
          name,
          email,
          department: department || "Clinical Care",
          requestedRole: requestedRole || "DOCTOR",
          reason,
          status: "Pending Review",
        });
      } catch (dbErr) {
        console.warn("AccessRequest save warning:", dbErr.message);
      }
    }
    
    if (!accessReq) {
      accessReq = {
        _id: `REQ-${Date.now().toString().slice(-4)}`,
        name,
        email,
        department: department || "Clinical Care",
        requestedRole: requestedRole || "DOCTOR",
        reason,
        status: "Pending Review",
        createdAt: new Date().toISOString(),
      };
    }

    // Dispatch email notification via Nodemailer helper
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e3a8a;">HealthForecast AI — Hospital Access Request</h2>
        <p>A new clinical staff access request has been submitted for platform review:</p>
        <ul style="line-height: 1.6;">
          <li><strong>Applicant Name:</strong> ${name}</li>
          <li><strong>Hospital Email:</strong> ${email}</li>
          <li><strong>Department:</strong> ${department || "Clinical Care"}</li>
          <li><strong>Requested Role:</strong> ${requestedRole || "DOCTOR"}</li>
          <li><strong>Justification / Reason:</strong> ${reason}</li>
        </ul>
        <p style="color: #64748b; font-size: 12px;">System Administrators will review this application shortly.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "HealthForecast AI — Hospital Credential Access Request Received",
      html: emailHtml,
      text: `Credential request submitted for ${name} (${requestedRole || "DOCTOR"}).`,
    });

    res.status(201).json({
      success: true,
      message: "Hospital credential request submitted successfully. Check your email inbox.",
      data: accessReq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request account password reset link via email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      res.status(400);
      throw new Error("Please enter a valid hospital email address");
    }

    const resetToken = `reset_${Math.random().toString(36).substring(2, 10)}`;
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    const resetHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1d4ed8;">HealthForecast AI — Account Password Reset</h2>
        <p>A password reset request was initiated for <strong>${email}</strong>.</p>
        <p>Click the link below to verify your hospital credentials and reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password Link</a></p>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Temporary Reset Token: <code>${resetToken}</code></p>
        <p style="color: #94a3b8; font-size: 11px;">If you did not request this email, please contact IT Governance immediately.</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "HealthForecast AI Password Reset Instructions",
      html: resetHtml,
      text: `Password reset link: ${resetUrl}`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your hospital email inbox.",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered platform users
// @route   GET /api/auth/users
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
        { _id: "USR-001", name: "Velam Mounika", email: "mounikavelam@gmail.com", role: "SYS_ADMIN", department: "IT & System Administration", createdAt: new Date() },
        { _id: "USR-002", name: "Student 23U41A4257", email: "23u41a4257@diet.edu.in", role: "DOCTOR", department: "Cardiology & ICU", createdAt: new Date() },
        { _id: "USR-003", name: "Super Admin", email: "sysadmin@healthforecast.ai", role: "SYS_ADMIN", department: "IT & Platform Governance", createdAt: new Date() },
        { _id: "USR-004", name: "Admin Sarah Jenkins", email: "admin@healthforecast.ai", role: "HOSPITAL_ADMIN", department: "Hospital Administration", createdAt: new Date() },
        { _id: "USR-005", name: "Dr. John Smith", email: "john.smith@healthforecast.ai", role: "DOCTOR", department: "Cardiology", createdAt: new Date() },
        { _id: "USR-006", name: "Dr. Alan Turing", email: "researcher@healthforecast.ai", role: "RESEARCHER", department: "Population Health & Research", createdAt: new Date() },
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

// @desc    Get all pending staff credential requests
// @route   GET /api/auth/requests
// @access  Public / Private (Admin)
const getAccessRequests = async (req, res, next) => {
  try {
    let requests = [];
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      requests = await AccessRequest.find().sort({ createdAt: -1 });
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

// @desc    Approve staff credential request & create User in MongoDB
// @route   PUT /api/auth/requests/:id/approve
// @access  Public / Private (Admin)
const approveAccessRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    let accessReq;
    const mongoose = require("mongoose");

    if (mongoose.connection.readyState === 1) {
      accessReq = await AccessRequest.findById(requestId);
    }

    const applicantEmail = accessReq?.email || req.body.email || "applicant@hospital.org";
    const applicantName = accessReq?.name || req.body.name || "Hospital Staff Member";
    const requestedRole = accessReq?.requestedRole || req.body.requestedRole || "DOCTOR";
    const department = accessReq?.department || req.body.department || "Clinical Care";

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    let newUser;
    if (mongoose.connection.readyState === 1) {
      // Check if user already exists
      const userExists = await User.findOne({ email: applicantEmail });
      if (!userExists) {
        newUser = await User.create({
          name: applicantName,
          email: applicantEmail,
          password: hashedPassword,
          role: requestedRole,
          department: department,
        });
      }

      if (accessReq) {
        accessReq.status = "Approved";
        await accessReq.save();
      }
    }

    // Send Approval Email Notification via Nodemailer
    const approvalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #10b981; border-radius: 12px;">
        <h2 style="color: #059669;">HealthForecast AI — Access Request Approved! 🎉</h2>
        <p>Dear <strong>${applicantName}</strong>,</p>
        <p>Your hospital staff credential request for the role of <strong>${requestedRole}</strong> in <strong>${department}</strong> has been approved by System Administration.</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Portal Login Credentials:</strong></p>
          <p style="margin: 5px 0 0 0;">Email: <code>${applicantEmail}</code></p>
          <p style="margin: 5px 0 0 0;">Temporary Password: <code>password123</code></p>
        </div>
        <p><a href="http://localhost:5173" style="background-color: #059669; color: white; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Sign In to Clinical Portal</a></p>
      </div>
    `;

    await sendEmail({
      to: applicantEmail,
      subject: "HealthForecast AI — Access Application Approved!",
      html: approvalHtml,
      text: `Your access request for ${applicantName} (${requestedRole}) has been approved. Password: password123`,
    });

    res.status(200).json({
      success: true,
      message: `Access request approved for ${applicantName}. Account created and confirmation email dispatched.`,
      user: newUser || { name: applicantName, email: applicantEmail, role: requestedRole },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject staff credential request
// @route   PUT /api/auth/requests/:id/reject
// @access  Public / Private (Admin)
const rejectAccessRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    let accessReq;
    const mongoose = require("mongoose");

    if (mongoose.connection.readyState === 1) {
      accessReq = await AccessRequest.findById(requestId);
      if (accessReq) {
        accessReq.status = "Rejected";
        await accessReq.save();
      }
    }

    const applicantEmail = accessReq?.email || req.body.email || "applicant@hospital.org";
    const applicantName = accessReq?.name || req.body.name || "Hospital Staff Member";

    // Send Rejection Notice via Nodemailer
    const rejectionHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #dc2626;">HealthForecast AI — Credential Request Update</h2>
        <p>Dear <strong>${applicantName}</strong>,</p>
        <p>Your hospital credential request has been reviewed by IT System Administration. At this time, your application was not approved.</p>
        <p style="color: #64748b; font-size: 12px;">If you believe this was an error, please contact your department supervisor or IT Governance.</p>
      </div>
    `;

    await sendEmail({
      to: applicantEmail,
      subject: "HealthForecast AI — Access Application Status Update",
      html: rejectionHtml,
      text: `Credential request for ${applicantName} was not approved.`,
    });

    res.status(200).json({
      success: true,
      message: `Access request rejected for ${applicantName}. Rejection notice email sent.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  validate2FAToken,
  getMeProfile,
  requestCredentials,
  forgotPassword,
  getUsers,
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
};
