// Role-Based Access Control (RBAC) Middleware

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Default fallback role for demo session if req.user is undefined
    const userRole = req.user ? req.user.role : "Doctor";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Role '${userRole}' is not authorized to perform this operation. Required: [${allowedRoles.join(", ")}]`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
