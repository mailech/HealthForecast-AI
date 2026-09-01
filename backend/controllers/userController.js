const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (System Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Update user status (active/inactive)
// @route   PUT /api/users/:id/status
// @access  Private (System Admin)
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, error: 'You cannot deactivate your own account' });
  }

  user.isActive = isActive;
  await user.save();

  // Audit status change
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `${isActive ? 'Activated' : 'Deactivated'} account of user ${user.email}`
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (System Admin)
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ success: false, error: 'Role is required' });
  }

  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Prevent self-role modification
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, error: 'You cannot change your own role' });
  }

  const oldRole = user.role;
  user.role = role;
  await user.save();

  // Audit role modification
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'USER_ROLE_UPDATED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Updated role of user ${user.email} from [${oldRole}] to [${role}]`
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get system audit logs
// @route   GET /api/users/audit-logs
// @access  Private (System Admin)
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  const logs = await AuditLog.find({})
    .populate('user', 'name role email')
    .sort({ createdAt: -1 })
    .limit(200);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (System Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
  }

  await user.deleteOne();

  // Audit delete
  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'USER_DELETED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: `Deleted user account: ${user.email}`
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});
