const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { ROLES } = require('../config/constants');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000', 10),
};

const sendTokenResponse = (res, user, statusCode = 200, message = 'Success') => {
  const token = signToken(user._id);
  res.cookie('jwt', token, COOKIE_OPTIONS);
  return res.status(statusCode).json({
    success: true,
    message,
    data: { user },
  });
};

const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  // Only admins can create admin accounts; this check is done in controller
  const user = await User.create({ name, email, password, role: role || ROLES.STAFF });
  return user;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Please contact an administrator.');
    err.statusCode = 403;
    throw err;
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    const err = new Error('Current password is incorrect.');
    err.statusCode = 400;
    throw err;
  }
  user.password = newPassword;
  await user.save();
  return user;
};

const updateProfile = async (userId, { name }) => {
  const user = await User.findByIdAndUpdate(userId, { name }, { new: true, runValidators: true });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getMe, sendTokenResponse, changePassword, updateProfile };
