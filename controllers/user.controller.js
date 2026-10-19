const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const userService = require('../services/user.service');

const getAll = asyncHandler(async (req, res) => {
  const result = await userService.getAll(req.query);
  return success(res, result);
});

const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateRole(req.params.id, req.body.role, req.user);
  return success(res, { user }, 'User role updated.');
});

const toggleActive = asyncHandler(async (req, res) => {
  const user = await userService.toggleActive(req.params.id, req.user);
  return success(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'}.`);
});

module.exports = { getAll, updateRole, toggleActive };
