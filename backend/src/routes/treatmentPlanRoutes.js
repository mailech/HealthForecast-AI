const express = require("express");
const router = express.Router();
const {
  createTreatmentPlan,
  getTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  deleteTreatmentPlan,
} = require("../controllers/treatmentPlanController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

// All treatment plan endpoints require authentication
router.use(protect);

router
  .route("/")
  .get(getTreatmentPlans)
  .post(authorizeRoles("DOCTOR", "HOSPITAL_ADMIN", "Doctor", "Admin"), createTreatmentPlan);

router
  .route("/:id")
  .get(getTreatmentPlanById)
  .put(authorizeRoles("DOCTOR", "HOSPITAL_ADMIN", "Doctor", "Admin"), updateTreatmentPlan)
  .delete(authorizeRoles("DOCTOR", "HOSPITAL_ADMIN", "Doctor", "Admin"), deleteTreatmentPlan);

module.exports = router;
