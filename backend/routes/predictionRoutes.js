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

    const predictionType = "Health Risk Prediction";

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