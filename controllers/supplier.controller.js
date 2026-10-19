const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const supplierService = require('../services/supplier.service');

const getAll = asyncHandler(async (req, res) => {
  const suppliers = await supplierService.getAll({ includeInactive: req.query.includeInactive === 'true' });
  return success(res, { suppliers });
});

const getById = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getById(req.params.id);
  return success(res, { supplier });
});

const create = asyncHandler(async (req, res) => {
  const supplier = await supplierService.create(req.body);
  return success(res, { supplier }, 'Supplier created.', 201);
});

const update = asyncHandler(async (req, res) => {
  const supplier = await supplierService.update(req.params.id, req.body);
  return success(res, { supplier }, 'Supplier updated.');
});

module.exports = { getAll, getById, create, update };
