const express = require("express");
const router = express.Router();
const {
  predictRisk,
  getPredictionHistory,
} = require("../controllers/predictionController");
const { apiLimiter } = require("../middleware/rateLimiter");

router.post("/predict", apiLimiter, predictRisk);
router.get("/history", getPredictionHistory);

module.exports = router;
