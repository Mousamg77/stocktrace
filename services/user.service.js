const User = require('../models/User');
const { ROLES } = require('../config/constants');

const getAll = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(),
  ]);
  return { users, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

const updateRole = async (userId, role, requestingUser) => {
  if (!Object.values(ROLES).includes(role)) {
    const err = new Error('Invalid role.');
    err.statusCode = 400;
    throw err;
  }
  if (userId === requestingUser._id.toString()) {
    const err = new Error('You cannot change your own role.');
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const toggleActive = async (userId, requestingUser) => {
  if (userId === requestingUser._id.toString()) {
    const err = new Error('You cannot deactivate your own account.');
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  return user;
};

module.exports = { getAll, updateRole, toggleActive };
