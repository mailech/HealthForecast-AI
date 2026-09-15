const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const PredictionHistory = require("../models/PredictionHistory");

// @desc    Get aggregated healthcare analytics calculated from real MongoDB data
// @route   GET /api/analytics, GET /api/prediction/analytics
// @access  Protected
const getAnalyticsData = async (req, res, next) => {
  try {
    const rawTf = (req.query.timeframe || "30d").toLowerCase();
    let timeframe = "30d";
    let daysThreshold = 30;

    if (rawTf === "6m" || rawTf === "6 months") {
      timeframe = "6m";
      daysThreshold = 180;
    } else if (rawTf === "1y" || rawTf === "1 year") {
      timeframe = "1y";
      daysThreshold = 365;
    }

    const startDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);

    let totalPatients = 0;
    let activePatients = 0;
    let dischargedPatients = 0;
    let avgDaysInCare = 0;
    let readmissionRate = 0;
    const medicationCompliance = null;
    const medicationComplianceAvailable = false;
    let riskDistribution = { High: 0, Medium: 0, Low: 0 };
    let highRiskCount = 0;

    let predictionStats = {
      totalPredictions: 0,
      readmissionPredictions: 0,
      notReadmittedPredictions: 0,
      readmissionPredictionRate: 0,
      highRiskPredictions: 0,
      mediumRiskPredictions: 0,
      lowRiskPredictions: 0,
      thresholdNote: "Project-Defined Threshold: score >= 20",
    };

    let readmissionCurves = [];
    let telemetry24h = [];

    let chfAvgRisk = 0;
    let copdAvgRisk = 0;
    let diabetesAvgRisk = 0;

    // Run real MongoDB Aggregations when database is connected
    if (mongoose.connection.readyState === 1) {
      // 1. Patient Collection Summary Aggregation
      const patientSummaryAgg = await Patient.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            activeCount: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
            dischargedCount: { $sum: { $cond: [{ $eq: ["$status", "Discharged"] }, 1, 0] } },
            avgDays: {
              $avg: {
                $max: [
                  1,
                  { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24] },
                ],
              },
            },
            readmittedCount: {
              $sum: {
                $cond: [
                  { $gt: [{ $ifNull: ["$vitals.previousAdmissions", "$previousAdmissions", 0] }, 0] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      if (patientSummaryAgg && patientSummaryAgg.length > 0 && patientSummaryAgg[0].count > 0) {
        totalPatients = patientSummaryAgg[0].count;
        activePatients = patientSummaryAgg[0].activeCount;
        dischargedPatients = patientSummaryAgg[0].dischargedCount;
        avgDaysInCare = Math.round((patientSummaryAgg[0].avgDays || 0) * 10) / 10;
        readmissionRate = Math.round((patientSummaryAgg[0].readmittedCount / totalPatients) * 1000) / 10;
      }

      // 2. Patient Risk Category Breakdown Aggregation
      const riskCategoryAgg = await Patient.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $toUpper: { $ifNull: ["$riskCategory", { $ifNull: ["$risk", "LOW"] }] } },
            count: { $sum: 1 },
          },
        },
      ]);

      riskCategoryAgg.forEach((r) => {
        if (r._id) {
          const norm = String(r._id).toUpperCase();
          if (norm === "HIGH") riskDistribution.High += r.count;
          else if (norm === "MEDIUM") riskDistribution.Medium += r.count;
          else riskDistribution.Low += r.count;
        }
      });
      highRiskCount = riskDistribution.High;

      // 3. Disease Condition Specific Risk Aggregation (CHF, COPD, Diabetes)
      const conditionRiskAgg = await Patient.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $toLower: "$disease" },
            avgScore: { $avg: { $ifNull: ["$riskScore", 50] } },
            count: { $sum: 1 },
          },
        },
      ]);

      conditionRiskAgg.forEach((item) => {
        const condName = (item._id || "").toLowerCase();
        if (condName.includes("heart") || condName.includes("chf")) {
          chfAvgRisk = Math.round(item.avgScore || 0);
        } else if (condName.includes("copd") || condName.includes("lung") || condName.includes("respiratory")) {
          copdAvgRisk = Math.round(item.avgScore || 0);
        } else if (condName.includes("diabet")) {
          diabetesAvgRisk = Math.round(item.avgScore || 0);
        }
      });

      // 4. PredictionHistory Collection Aggregations
      const predictionSummaryAgg = await PredictionHistory.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            highCount: { $sum: { $cond: [{ $eq: ["$level", "HIGH"] }, 1, 0] } },
            mediumCount: { $sum: { $cond: [{ $eq: ["$level", "MEDIUM"] }, 1, 0] } },
            lowCount: { $sum: { $cond: [{ $eq: ["$level", "LOW"] }, 1, 0] } },
            readmissionCount: { $sum: { $cond: [{ $gte: ["$score", 20] }, 1, 0] } },
            notReadmittedCount: { $sum: { $cond: [{ $lt: ["$score", 20] }, 1, 0] } },
          },
        },
      ]);

      if (predictionSummaryAgg && predictionSummaryAgg.length > 0 && predictionSummaryAgg[0].total > 0) {
        const pTotal = predictionSummaryAgg[0].total;
        const pReadmit = predictionSummaryAgg[0].readmissionCount;
        predictionStats = {
          totalPredictions: pTotal,
          readmissionPredictions: pReadmit,
          notReadmittedPredictions: predictionSummaryAgg[0].notReadmittedCount,
          readmissionPredictionRate: Math.round((pReadmit / pTotal) * 1000) / 10,
          highRiskPredictions: predictionSummaryAgg[0].highCount,
          mediumRiskPredictions: predictionSummaryAgg[0].mediumCount,
          lowRiskPredictions: predictionSummaryAgg[0].lowCount,
          thresholdNote: "Project-Defined Threshold: score >= 20",
        };
      }

      // 5. Real Date-based Monthly Prediction Trends from PredictionHistory
      const trendAgg = await PredictionHistory.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            avgScore: { $avg: "$score" },
            count: { $sum: 1 },
            readmissionCount: { $sum: { $cond: [{ $gte: ["$score", 20] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      if (trendAgg && trendAgg.length > 0) {
        readmissionCurves = trendAgg.map((item) => ({
          month: item._id,
          predictedRisk: Math.round((item.avgScore || 0) * 10) / 10,
          predictedReadmissionCount: item.readmissionCount,
          count: item.count,
        }));
      }

      // 6. Hourly Telemetry Aggregation from Patient Vitals
      const telemetryAgg = await Patient.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: { $hour: "$updatedAt" },
            avgGlucose: { $avg: { $ifNull: ["$vitals.glucose", 100] } },
            avgBmi: { $avg: { $ifNull: ["$vitals.bmi", 24.5] } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      if (telemetryAgg && telemetryAgg.length > 0) {
        telemetry24h = telemetryAgg.map((item) => ({
          time: `${String(item._id).padStart(2, "0")}:00`,
          glucose: Math.round(item.avgGlucose || 100),
          bmi: Math.round((item.avgBmi || 24.5) * 10) / 10,
          count: item.count,
        }));
      }
    }

    res.status(200).json({
      success: true,
      timeframe,
      data: {
        timeframe,
        totalPatients,
        activePatients,
        dischargedPatients,
        avgDaysInCare,
        readmissionRate,
        medicationCompliance,
        medicationComplianceAvailable,
        highRiskCount,
        riskDistribution,
        predictionStats,
        telemetry24h,
        readmissionCurves,
        summary: {
          chf30DayReadmissionRisk: `${chfAvgRisk} Average Risk Index`,
          copd30DayReadmissionRisk: `${copdAvgRisk} Average Risk Index`,
          diabetes30DayReadmissionRisk: `${diabetesAvgRisk} Average Risk Index`,
          riskType: "Project-Defined Model Risk Index (Score 0-100)",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsData,
};


