const express = require("express");
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

router.route("/").get(getPatients).post(createPatient);
router
  .route("/:id")
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;