const express = require("express");
const router = express.Router();
const {
  getAlerts,
  toggleAlertStatus,
  markAllAlertsRead,
  dismissAlert,
} = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/rbacMiddleware");

router.get(
  "/",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RESEARCHER"),
  getAlerts
);
router.put(
  "/read-all",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"),
  markAllAlertsRead
);
router.put(
  "/:id/toggle",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"),
  toggleAlertStatus
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("SYS_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"),
  dismissAlert
);

module.exports = router;

