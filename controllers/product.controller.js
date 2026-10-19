const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const productService = require('../services/product.service');

const getAll = asyncHandler(async (req, res) => {
  const result = await productService.getAll(req.query);
  return success(res, result);
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  return success(res, { product });
});

const getByQrId = asyncHandler(async (req, res) => {
  const product = await productService.getByQrId(req.params.qrId);
  return success(res, { product });
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body, req.user._id);
  return success(res, { product }, 'Product created successfully.', 201);
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  return success(res, { product }, 'Product updated successfully.');
});

const archive = asyncHandler(async (req, res) => {
  const product = await productService.archive(req.params.id);
  return success(res, { product }, 'Product archived successfully.');
});

module.exports = { getAll, getById, getByQrId, create, update, archive };
