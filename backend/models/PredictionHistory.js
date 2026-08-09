const mongoose = require("mongoose");

const predictionHistorySchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    inputMetrics: {
      age: Number,
      glucose: Number,
      bp: String,
      bmi: Number,
      previousAdmissions: Number,
    },
    score: {
      type: Number,
      required: true,
    },
    level: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },
    confidence: {
      type: Number,
      default: 95.0,
    },
    recommendations: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PredictionHistory", predictionHistorySchema);
