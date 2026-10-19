const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const categoryService = require('../services/category.service');

const getAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAll({ includeInactive: req.query.includeInactive === 'true' });
  return success(res, { categories });
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  return success(res, { category });
});

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  return success(res, { category }, 'Category created.', 201);
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  return success(res, { category }, 'Category updated.');
});

module.exports = { getAll, getById, create, update };
