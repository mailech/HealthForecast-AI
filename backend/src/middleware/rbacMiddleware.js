// Role-Based Access Control (RBAC) Middleware
// Canonical Roles: SYS_ADMIN, HOSPITAL_ADMIN, DOCTOR, RESEARCHER

const normalizeRole = (role) => {
  if (!role) return "";
  const upper = String(role).toUpperCase().trim();
  if (upper === "SYS_ADMIN" || upper === "SUPER_ADMIN" || upper === "SYSADMIN") return "SYS_ADMIN";
  if (upper === "HOSPITAL_ADMIN" || upper === "ADMIN" || upper === "HOSPITAL ADMIN") return "HOSPITAL_ADMIN";
  if (upper === "DOCTOR" || upper === "NURSE" || upper === "RADIOLOGIST" || upper === "STAFF" || upper === "PHYSICIAN") return "DOCTOR";
  if (upper === "RESEARCHER" || upper === "RESEARCH") return "RESEARCHER";
  return upper;
};

const authorizeRoles = (...allowedRoles) => {
  const canonicalAllowed = allowedRoles.map((r) => normalizeRole(r));

  return (req, res, next) => {
    // Strictly require authenticated user object from protect middleware
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: "Not authorized, authentication required",
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!canonicalAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Role '${req.user.role}' is not authorized to perform this operation. Required: [${allowedRoles.join(", ")}]`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles, normalizeRole };

