const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Helper to sign JWTs
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123456_healthforecast',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_7891011_healthforecast',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Set cookies helper
const sendTokenResponse = (user, statusCode, res) => {
  const { accessToken, refreshToken } = generateTokens(user);

  // Cookie options
  const isProd = process.env.NODE_ENV === 'production';
  const accessCookieOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  const refreshCookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  // Save refresh token to user document
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, accessCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json({
      success: true,
      token: accessToken, // Also returned for client headers if needed
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty
      }
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (In production, usually System Admin registers users, but we enable public register for onboarding/testing convenience)
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, specialty } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, error: 'User already exists' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'doctor', // Default role
    specialty: specialty || ''
  });

  // Log audit trail
  await AuditLog.create({
    user: user._id,
    userEmail: user.email,
    action: 'USER_REGISTERED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `User registered successfully with role: ${user.role}`
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  // Find user and select password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    // Audit failed login
    await AuditLog.create({
      action: 'LOGIN_FAILED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Failed login attempt for email: ${email}`
    });
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    // Audit failed login
    await AuditLog.create({
      user: user._id,
      userEmail: user.email,
      action: 'LOGIN_FAILED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Incorrect password entered for user: ${email}`
    });
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Audit successful login
  await AuditLog.create({
    user: user._id,
    userEmail: user.email,
    action: 'LOGIN_SUCCESS',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `User logged in successfully`
  });

  sendTokenResponse(user, 200, res);
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = (req.cookies && req.cookies.refreshToken) || 
                       (req.body && req.body.refreshToken);

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_7891011_healthforecast'
    );

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token session' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Refresh token expired or invalid' });
  }
});

// @desc    Logout user & clear cookies
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  // Clear refresh token in database
  if (req.user) {
    req.user.refreshToken = '';
    await req.user.save({ validateBeforeSave: false });

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      action: 'LOGOUT_SUCCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `User logged out successfully`
    });
  }

  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      specialty: req.user.specialty
    }
  });
});
