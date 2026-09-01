const express = require('express');
const { runPrediction, getPredictionHistory, submitFeedback } = require('../controllers/predictionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/run/:patientId', protect, authorize('doctor', 'system_admin'), runPrediction);
router.get('/patient/:patientId', protect, getPredictionHistory);
router.post('/:id/feedback', protect, authorize('doctor', 'system_admin'), submitFeedback);

module.exports = router;
