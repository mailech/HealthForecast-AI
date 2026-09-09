const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ==========================================
// ADD TREATMENT
// ==========================================

router.post("/", (req, res) => {
    const {
        patient_id,
        doctor_id,
        diagnosis,
        treatment_plan,
        medication,
        dosage,
        status,
        doctor_notes,
        follow_up_date
    } = req.body;

    if (
        !patient_id ||
        !doctor_id ||
        !diagnosis ||
        !treatment_plan
    ) {
        return res.status(400).json({
            success: false,
            message: "Patient, doctor, diagnosis and treatment plan are required"
        });
    }

    const sql = `
        INSERT INTO treatments
        (
            patient_id,
            doctor_id,
            diagnosis,
            treatment_plan,
            medication,
            dosage,
            status,
            doctor_notes,
            follow_up_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            patient_id,
            doctor_id,
            diagnosis,
            treatment_plan,
            medication || null,
            dosage || null,
            status || "Ongoing",
            doctor_notes || null,
            follow_up_date || null
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Treatment database error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to save treatment",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Treatment saved successfully",
                treatment_id: result.insertId
            });
        }
    );
});

// ==========================================
// GET TREATMENTS FOR PATIENT
// ==========================================

router.get("/:patientId", (req, res) => {

    const sql = `
        SELECT *
        FROM treatments
        WHERE patient_id = ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [req.params.patientId],
        (err, results) => {

            if (err) {
                console.error(
                    "Treatment fetch error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch treatments"
                });
            }

            res.json({
                success: true,
                treatments: results
            });
        }
    );
});

module.exports = router;