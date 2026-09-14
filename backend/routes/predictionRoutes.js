const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ==========================================
// SAVE AI RISK PREDICTION
// ==========================================

router.post("/", (req, res) => {
    const {
        patient_id,
        risk_score,
        risk_level,
        contributing_factors
    } = req.body;

    // Validate required fields
    if (
        !patient_id ||
        risk_score === undefined ||
        !risk_level
    ) {
        return res.status(400).json({
            success: false,
            message: "Required prediction data is missing"
        });
    }

    const predictionType = "risk";

    const factors =
        contributing_factors ||
        "Age, blood pressure, glucose, BMI, heart rate and previous hospitalization";

    const sql = `
        INSERT INTO predictions
        (
            patient_id,
            prediction_type,
            risk_level,
            risk_score,
            contributing_factors
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            patient_id,
            predictionType,
            risk_level,
            risk_score,
            factors
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Prediction database error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to save prediction",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Prediction saved successfully",
                prediction_id: result.insertId
            });
        }
    );
});

// ==========================================
// DASHBOARD PREDICTION STATISTICS
// ==========================================

router.get("/stats", (req, res) => {
    const sql = `
        SELECT
            COUNT(
                CASE
                    WHEN prediction_type = 'risk'
                    THEN 1
                END
            ) AS aiPredictions,

            COUNT(
                CASE
                    WHEN prediction_type = 'readmission'
                    THEN 1
                END
            ) AS readmissions,

            COUNT(
                CASE
                    WHEN prediction_type = 'risk'
                    AND LOWER(risk_level) = 'high'
                    THEN 1
                END
            ) AS highRisk

        FROM predictions
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(
                "Prediction statistics error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch prediction statistics"
            });
        }

        const stats = results[0];

        res.json({
            success: true,
            highRisk: Number(stats.highRisk) || 0,
            aiPredictions: Number(stats.aiPredictions) || 0,
            readmissions: Number(stats.readmissions) || 0
        });
    });
});

// ==========================================
// GET PREDICTIONS FOR PATIENT
// ==========================================

router.get("/:patientId", (req, res) => {

    const sql = `
        SELECT *
        FROM predictions
        WHERE patient_id = ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [req.params.patientId],
        (err, results) => {

            if (err) {
                console.error(
                    "Prediction fetch error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch predictions"
                });
            }

            res.json({
                success: true,
                predictions: results
            });
        }
    );
});

module.exports = router;