const express = require("express");
const router = express.Router();
const {
  predictRisk,
  getPredictionHistory,
  getAnalyticsChartData,
} = require("../controllers/predictionController");
const { apiLimiter } = require("../middleware/rateLimiter");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

router.post(
  "/predict",
  apiLimiter,
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  predictRisk
);
router.get(
  "/history",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  getPredictionHistory
);
router.get(
  "/analytics",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  getAnalyticsChartData
);
router.get(
  "/chart-data",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  getAnalyticsChartData
);

module.exports = router;

