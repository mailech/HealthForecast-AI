const express = require("express");
const router = express.Router();
const { getPendingRequests, getUsers } = require("../controllers/userController");
const { requestCredentials, approveAccessRequest, rejectAccessRequest } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

// Public credential request endpoint
router.post("/request-credentials", requestCredentials);

// Protected Admin-Only user management endpoints
router.get("/pending", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), getPendingRequests);
router.get("/requests", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), getPendingRequests);
router.get("/", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), getUsers);
router.put("/:id/approve", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), approveAccessRequest);
router.put("/:id/reject", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), rejectAccessRequest);
router.put("/requests/:id/approve", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), approveAccessRequest);
router.put("/requests/:id/reject", protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"), rejectAccessRequest);

module.exports = router;

