const Alert = require("../models/Alert");

// @desc    Get all alerts with severity filtering
// @route   GET /api/alerts
// @access  Public / Protected
const getAlerts = async (req, res, next) => {
  try {
    const severity = req.query.severity;
    let query = {};

    if (severity && severity !== "All") {
      query.severity = severity;
    }

    const alerts = await Alert.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Alert status between "Active" and "Resolved"
// @route   PUT /api/alerts/:id/toggle
// @access  Public / Protected
const toggleAlertStatus = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      res.status(404);
      throw new Error("Alert notification not found");
    }

    alert.status = alert.status === "Active" ? "Resolved" : "Active";
    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      message: `Alert status toggled to '${alert.status}'`,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/alerts/read-all
// @access  Public / Protected
const markAllAlertsRead = async (req, res, next) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All alerts marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dismiss / delete alert
// @route   DELETE /api/alerts/:id
// @access  Public / Protected
const dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      res.status(404);
      throw new Error("Alert notification not found");
    }

    await alert.deleteOne();

    res.status(200).json({
      success: true,
      message: "Alert dismissed successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  toggleAlertStatus,
  markAllAlertsRead,
  dismissAlert,
};
