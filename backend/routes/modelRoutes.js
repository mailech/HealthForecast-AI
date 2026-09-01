const express = require('express');
const { getModelMetrics, retrainModel, configureModel } = require('../controllers/modelController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/metrics', protect, getModelMetrics);
router.post('/retrain', protect, authorize('system_admin'), retrainModel);
router.post('/configure', protect, authorize('system_admin'), configureModel);

module.exports = router;
