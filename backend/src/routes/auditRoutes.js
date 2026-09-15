const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

router.get(
  "/",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"),
  getAuditLogs
);

module.exports = router;

