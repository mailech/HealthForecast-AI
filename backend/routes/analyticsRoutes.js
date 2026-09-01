const express = require('express');
const { getSummaryStats, getAnalyticsTrends } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, getSummaryStats);
router.get('/trends', protect, getAnalyticsTrends);

module.exports = router;
