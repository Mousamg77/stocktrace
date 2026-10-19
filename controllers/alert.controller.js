const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const alertService = require('../services/alert.service');

const getAll = asyncHandler(async (req, res) => {
  const result = await alertService.getAlerts(req.query);
  return success(res, result);
});

const resolve = asyncHandler(async (req, res) => {
  const alert = await alertService.resolveAlertById(req.params.id, req.user._id);
  return success(res, { alert }, 'Alert resolved.');
});

const getCounts = asyncHandler(async (req, res) => {
  const counts = await alertService.getAlertCounts();
  return success(res, { counts });
});

module.exports = { getAll, resolve, getCounts };
