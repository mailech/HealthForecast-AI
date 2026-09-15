const express = require("express");
const router = express.Router();
const { downloadReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

router.get(
  "/download",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  downloadReport
);
router.get(
  "/:id/download",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  downloadReport
);

module.exports = router;

