const express = require("express");
const router = express.Router();
const { getAnalyticsData } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

router.get(
  "/",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  getAnalyticsData
);

module.exports = router;

