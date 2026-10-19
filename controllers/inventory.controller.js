const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const inventoryService = require('../services/inventory.service');

const stockIn = asyncHandler(async (req, res) => {
  const { productId, quantity, supplier: supplierId, referenceNo, notes } = req.body;
  const result = await inventoryService.stockIn({
    productId, quantity: Number(quantity), supplierId, referenceNo, notes, userId: req.user._id,
  });
  return success(res, result, 'Stock-in recorded successfully.', 201);
});

const stockOut = asyncHandler(async (req, res) => {
  const { productId, quantity, referenceNo, notes } = req.body;
  const result = await inventoryService.stockOut({
    productId, quantity: Number(quantity), referenceNo, notes, userId: req.user._id,
  });
  return success(res, result, 'Stock-out recorded successfully.', 201);
});

const adjustment = asyncHandler(async (req, res) => {
  const { productId, quantity, type, notes } = req.body;
  const result = await inventoryService.adjustment({
    productId, quantity: Number(quantity), type, notes, userId: req.user._id,
  });
  return success(res, result, 'Adjustment recorded successfully.', 201);
});

const reverseMovement = asyncHandler(async (req, res) => {
  const result = await inventoryService.reverseMovement(req.params.movementId, req.user._id);
  return success(res, result, 'Movement reversed successfully.');
});

const getHistory = asyncHandler(async (req, res) => {
  const result = await inventoryService.getHistory(req.query);
  return success(res, result);
});

const getSummary = asyncHandler(async (req, res) => {
  const summary = await inventoryService.getSummary();
  return success(res, { summary });
});

module.exports = { stockIn, stockOut, adjustment, reverseMovement, getHistory, getSummary };
