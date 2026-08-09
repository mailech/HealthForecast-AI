const express = require("express");
const router = express.Router();
const {
  getAlerts,
  toggleAlertStatus,
  markAllAlertsRead,
  dismissAlert,
} = require("../controllers/alertController");

router.get("/", getAlerts);
router.put("/read-all", markAllAlertsRead);
router.put("/:id/toggle", toggleAlertStatus);
router.delete("/:id", dismissAlert);

module.exports = router;
