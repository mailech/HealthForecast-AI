const express = require('express');
const { getSummaryStats, getAnalyticsTrends, getDatasetOverview, downloadDataset } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, getSummaryStats);
router.get('/trends', protect, getAnalyticsTrends);
router.get('/dataset-info', protect, getDatasetOverview);
router.get('/download-dataset', protect, downloadDataset);

module.exports = router;
