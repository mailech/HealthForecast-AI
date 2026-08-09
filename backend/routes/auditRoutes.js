const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

router.get("/", authorizeRoles("Admin", "Doctor"), getAuditLogs);

module.exports = router;
