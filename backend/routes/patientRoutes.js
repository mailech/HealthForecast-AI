const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getPatients,
    getPatientById,
    addPatient,
    deletePatient
} = require("../controllers/patientController");


// View patients
router.get(
    "/",
    authMiddleware,
    getPatients
);


// View individual patient
router.get(
    "/:id",
    authMiddleware,
    getPatientById
);


// Add patient
router.post(
    "/",
    authMiddleware,
    roleMiddleware("doctor", "hospital_admin", "system_admin"),
    addPatient
);


// Delete patient
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("hospital_admin", "system_admin"),
    deletePatient
);


module.exports = router;