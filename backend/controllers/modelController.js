const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorMiddleware');

// In-memory model metrics state representing the MLOps dashboard state
let modelState = {
  name: 'XGBoost - Hospital Readmission Predictor v2.4',
  accuracy: 83.2,
  precision: 81.5,
  recall: 79.8,
  f1Score: 80.6,
  auc: 0.88,
  status: 'Idle',
  lastTrained: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
  datasetSize: 101766, // Size matching the actual Diabetes 130-US Hospitals dataset
  epochs: 100,
  learningRate: 0.05
};

// @desc    Get current AI model metrics & status
// @route   GET /api/model/metrics
// @access  Private (System Admin, Doctor, Hospital Admin, Researcher)
exports.getModelMetrics = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: modelState
  });
});

// @desc    Trigger simulated AI model retraining
// @route   POST /api/model/retrain
// @access  Private (System Admin)
exports.retrainModel = asyncHandler(async (req, res, next) => {
  if (modelState.status === 'Training') {
    return res.status(400).json({ success: false, error: 'Model training is already in progress' });
  }

  // Update status to training
  modelState.status = 'Training';

  // Audit training trigger
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'AI_MODEL_RETRAIN_TRIGGERED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Triggered retraining process for model: ${modelState.name}`
  });

  // Run async simulated training
  setTimeout(async () => {
    try {
      // Simulate performance gains
      modelState.accuracy = 84.7;
      modelState.precision = 83.1;
      modelState.recall = 81.4;
      modelState.f1Score = 82.2;
      modelState.auc = 0.91;
      modelState.datasetSize += 124; // Simulated newly added patient entries
      modelState.status = 'Idle';
      modelState.lastTrained = new Date().toISOString().split('T')[0];

      // Audit complete
      await AuditLog.create({
        action: 'AI_MODEL_RETRAIN_COMPLETED',
        details: `Retrained model ${modelState.name} successfully. Accuracy updated to 84.7%, AUC to 0.91.`
      });
      console.log('Simulated AI Model Retraining Complete.');
    } catch (err) {
      modelState.status = 'Failed';
      console.error('Simulated AI Model Retraining Failed: ', err);
    }
  }, 10000); // 10 seconds simulation delay

  res.status(200).json({
    success: true,
    message: 'Model retraining started in background',
    data: modelState
  });
});

// @desc    Optimize model hyperparameters
// @route   POST /api/model/configure
// @access  Private (System Admin)
exports.configureModel = asyncHandler(async (req, res, next) => {
  const { learningRate, epochs } = req.body;

  if (learningRate) modelState.learningRate = Number(learningRate);
  if (epochs) modelState.epochs = Number(epochs);

  // Audit configuration update
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'AI_MODEL_CONFIGURED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Updated parameters: epochs=${modelState.epochs}, learningRate=${modelState.learningRate}`
  });

  res.status(200).json({
    success: true,
    message: 'Hyperparameters configured successfully',
    data: modelState
  });
});
