const express = require('express');
const router = express.Router();
const mlModel = require('./mlModel');

// Define API endpoint for patient risk prediction
router.post('/predict', async (req, res) => {
    const patientData = req.body;
    const prediction = await mlModel.predict(patientData);
    res.json({ prediction });
});

module.exports = router;