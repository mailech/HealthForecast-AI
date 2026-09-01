const express = require("express");
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  downloadCarePlan,
} = require("../controllers/patientController");

router.route("/").get(getPatients).post(createPatient);
router.get("/:id/download-pdf", downloadCarePlan);
router.get("/:id/care-plan/download", downloadCarePlan);
router
  .route("/:id")
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;