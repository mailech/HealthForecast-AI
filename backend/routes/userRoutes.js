const express = require('express');
const {
  getUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAuditLogs
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Enforce System Admin for all routes here
router.use(protect, authorize('system_admin'));

router.route('/')
  .get(getUsers);

router.route('/audit-logs')
  .get(getAuditLogs);

router.route('/:id')
  .delete(deleteUser);

router.route('/:id/status')
  .put(updateUserStatus);

router.route('/:id/role')
  .put(updateUserRole);

module.exports = router;
