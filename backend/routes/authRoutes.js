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
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/request-credentials", requestCredentials);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/users", getUsers);
router.get("/requests", getAccessRequests);
router.get("/pending-requests", getAccessRequests);
router.get("/pending", getAccessRequests);
router.put("/requests/:id/approve", approveAccessRequest);
router.put("/requests/:id/reject", rejectAccessRequest);
router.post("/2fa/validate", protect, validate2FAToken);
router.get("/me", protect, getMeProfile);

module.exports = router;
