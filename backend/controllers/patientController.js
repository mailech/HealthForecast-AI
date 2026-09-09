const db = require("../config/db");

// GET ALL PATIENTS
const getPatients = async (req, res) => {
    try {
        const [patients] = await db.promise().query(
            `SELECT 
                p.*,
                mr.blood_pressure,
                mr.blood_glucose,
                mr.bmi,
                mr.heart_rate
             FROM patients p
             LEFT JOIN medical_records mr 
             ON p.id = mr.patient_id
             ORDER BY p.created_at DESC`
        );

        res.json({
            success: true,
            patients
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patients"
        });
    }
};


// GET SINGLE PATIENT
const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;

        const [patients] = await db.promise().query(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const [records] = await db.promise().query(
            `SELECT * FROM medical_records
             WHERE patient_id = ?
             ORDER BY created_at DESC`,
            [id]
        );

        const [treatments] = await db.promise().query(
            `SELECT 
                t.*,
                u.name AS doctor_name
             FROM treatments t
             LEFT JOIN users u ON t.doctor_id = u.id
             WHERE t.patient_id = ?
             ORDER BY t.created_at DESC`,
            [id]
        );

        const [predictions] = await db.promise().query(
            `SELECT * FROM predictions
             WHERE patient_id = ?
             ORDER BY created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            patient: patients[0],
            medicalRecords: records,
            treatments,
            predictions
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patient"
        });
    }
};


// ADD PATIENT
const addPatient = async (req, res) => {
    try {
        const {
            patient_id,
            name,
            age,
            gender,
            contact,
            blood_group,
            medical_history,
            existing_diseases
        } = req.body;

        if (!patient_id || !name || !age) {
            return res.status(400).json({
                success: false,
                message: "Patient ID, name and age are required"
            });
        }

        const [result] = await db.promise().query(
            `INSERT INTO patients
            (patient_id, name, age, gender, contact, blood_group,
             medical_history, existing_diseases)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patient_id,
                name,
                age,
                gender || null,
                contact || null,
                blood_group || null,
                medical_history || null,
                existing_diseases || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Patient added successfully",
            patientId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add patient"
        });
    }
};


// DELETE PATIENT
const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        await db.promise().query(
            "DELETE FROM patients WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Patient deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete patient"
        });
    }
};


module.exports = {
    getPatients,
    getPatientById,
    addPatient,
    deletePatient
};