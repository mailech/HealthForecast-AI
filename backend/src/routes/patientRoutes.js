const express = require("express");
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  downloadCarePlan,
  assignDoctor,
} = require("../controllers/patientController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

router
  .route("/")
  .get(protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"), getPatients)
  .post(protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"), createPatient);

router.put(
  "/:id/assign-doctor",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN"),
  assignDoctor
);

router.get(
  "/:id/download-pdf",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  downloadCarePlan
);
router.get(
  "/:id/care-plan/download",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  downloadCarePlan
);

router
  .route("/:id")
  .get(protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"), getPatientById)
  .put(protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"), updatePatient)
  .delete(protect, authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"), deletePatient);

module.exports = router;