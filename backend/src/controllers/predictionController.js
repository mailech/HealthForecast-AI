const PredictionHistory = require("../models/PredictionHistory");
const axios = require("axios");

// @desc    Calculate 30-day readmission risk prediction & log history
// @route   POST /api/prediction/predict
// @access  Public / Protected
const predictRisk = async (req, res, next) => {
  try {
    const {
      patientName,
      age_range,
      age,
      time_in_hospital,
      num_lab_procedures,
      num_medications,
      number_inpatient,
      number_emergency,
      number_diagnoses,
      max_glu_serum,
      A1Cresult,
      diabetesMed,
    } = req.body;

    const ageRangeVal = age_range || age || "[60-70)";

    if (
      !patientName ||
      time_in_hospital == null ||
      num_lab_procedures == null ||
      num_medications == null ||
      number_inpatient == null ||
      number_emergency == null ||
      number_diagnoses == null ||
      !max_glu_serum ||
      !A1Cresult ||
      !diabetesMed
    ) {
      res.status(400);
      throw new Error(
        "Please provide all required clinical parameters (patientName, age_range, time_in_hospital, num_lab_procedures, num_medications, number_inpatient, number_emergency, number_diagnoses, max_glu_serum, A1Cresult, diabetesMed)"
      );
    }

    const payload = {
      patientName,
      age_range: String(ageRangeVal),
      time_in_hospital: Number(time_in_hospital),
      num_lab_procedures: Number(num_lab_procedures),
      num_medications: Number(num_medications),
      number_inpatient: Number(number_inpatient),
      number_emergency: Number(number_emergency),
      number_diagnoses: Number(number_diagnoses),
      max_glu_serum: String(max_glu_serum),
      A1Cresult: String(A1Cresult),
      diabetesMed: String(diabetesMed),
    };

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
    let mlData = null;

    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, payload);
      if (mlResponse.data && mlResponse.data.success && mlResponse.data.data) {
        mlData = mlResponse.data.data;
      }
    } catch (mlErr) {
      console.error("ML Service call error:", mlErr.message);
      return res.status(503).json({
        success: false,
        error: "ML Prediction Service is currently unavailable. Ensure the FastAPI ML service is running.",
      });
    }

    if (!mlData) {
      return res.status(503).json({
        success: false,
        error: "ML Service did not return valid prediction data.",
      });
    }

    const {
      score,
      level,
      confidence,
      probabilities,
      feature_explanations,
      recommendations,
      model_version,
      algorithm,
    } = mlData;

    // Save prediction history to MongoDB audit trail if connected
    const mongoose = require("mongoose");
    let historyEntry = { _id: `PRED-${Date.now()}`, createdAt: new Date().toISOString() };
    if (mongoose.connection.readyState === 1) {
      try {
        historyEntry = await PredictionHistory.create({
          patientName,
          inputMetrics: payload,
          score,
          level,
          confidence,
          recommendations,
        });
      } catch (dbErr) {
        console.warn("PredictionHistory DB save warning:", dbErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        predictionId: historyEntry._id,
        patientName,
        score,
        level,
        confidence,
        probabilities,
        feature_explanations,
        recommendations,
        model_version,
        algorithm,
        createdAt: historyEntry.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prediction history logs
// @route   GET /api/prediction/history
// @access  Public / Protected
const getPredictionHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let history = [];
    let total = 0;
    const mongoose = require("mongoose");

    if (mongoose.connection.readyState === 1) {
      total = await PredictionHistory.countDocuments();
      history = await PredictionHistory.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// Gaussian Normal Distribution Helper (Box-Muller Transform)
function randomGaussian(mean = 0, stdDev = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + stdDev * num;
}

const { getAnalyticsData } = require("./analyticsController");

const getAnalyticsChartData = async (req, res, next) => {
  return getAnalyticsData(req, res, next);
};

module.exports = {
  predictRisk,
  getPredictionHistory,
  getAnalyticsChartData,
};
