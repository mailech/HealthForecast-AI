const express = require("express");
const router = express.Router();
const {
  predictRisk,
  getPredictionHistory,
  getAnalyticsChartData,
} = require("../controllers/predictionController");
const { apiLimiter } = require("../middleware/rateLimiter");

router.post("/predict", apiLimiter, predictRisk);
router.get("/history", getPredictionHistory);
router.get("/analytics", getAnalyticsChartData);
router.get("/chart-data", getAnalyticsChartData);

module.exports = router;
