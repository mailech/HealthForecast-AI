const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  validate2FAToken,
  getMeProfile,
  requestCredentials,
  forgotPassword,
  resetPassword,
  getUsers,
  getAccessRequests,
  getPendingRequests,
  approveAccessRequest,
  rejectAccessRequest,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

// Public Auth Endpoints
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/request-credentials", requestCredentials);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected User/Admin Management Endpoints
router.get("/users", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), getUsers);
router.get("/requests", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), getAccessRequests);
router.get("/pending-requests", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), getAccessRequests);
router.get("/pending", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), getAccessRequests);
router.put("/requests/:id/approve", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), approveAccessRequest);
router.put("/requests/:id/reject", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), rejectAccessRequest);

// Protected User Self Endpoints
router.post("/2fa/validate", protect, validate2FAToken);
router.get("/me", protect, getMeProfile);

module.exports = router;

