const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  // Check header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123456_healthforecast');

    // Get user from DB
    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, error: 'User is no longer active or exists' });
    }

    next();
  } catch (error) {
    // Audit log for security breaches
    await AuditLog.create({
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Failed token verification: ${error.message}. Path: ${req.originalUrl}`
    });
    
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Audit log the unauthorized access attempt
      AuditLog.create({
        user: req.user ? req.user._id : null,
        userEmail: req.user ? req.user.email : 'Anonymous',
        action: 'FORBIDDEN_ROLE_ATTEMPT',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `User with role [${req.user ? req.user.role : 'none'}] attempted unauthorized access to: ${req.originalUrl}`
      });

      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
