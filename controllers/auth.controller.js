const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const authService = require('../services/auth.service');
const { ROLES } = require('../config/constants');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  // Only admins can create admin accounts; others default to staff
  const assignedRole = req.user?.role === ROLES.ADMIN ? role : undefined;
  const user = await authService.register({ name, email, password, role: assignedRole });
  authService.sendTokenResponse(res, user, 201, 'Account created successfully.');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login({ email, password });
  authService.sendTokenResponse(res, user, 200, 'Logged in successfully.');
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  return success(res, null, 'Logged out successfully.');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return success(res, { user });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await authService.changePassword(req.user._id, req.body);
  return success(res, { user }, 'Password changed successfully.');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  return success(res, { user }, 'Profile updated successfully.');
});

module.exports = { register, login, logout, getMe, changePassword, updateProfile };
