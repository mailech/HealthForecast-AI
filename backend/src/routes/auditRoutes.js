const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

router.get("/", authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "Admin", "Doctor", "DOCTOR"), getAuditLogs);

module.exports = router;
