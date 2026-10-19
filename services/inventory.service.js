const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const alertService = require('./alert.service');
const { MOVEMENT_TYPES } = require('../config/constants');

/**
 * Atomically updates product quantity and creates a movement record.
 * Uses findOneAndUpdate with $inc to prevent race conditions.
 */
const performMovement = async ({ productId, type, quantity, userId, supplierId, referenceNo, notes, isAdjustment = false }) => {
  // Fetch product inside the atomic operation
  let product;

  if (type === MOVEMENT_TYPES.STOCK_OUT || (isAdjustment && type === MOVEMENT_TYPES.STOCK_OUT)) {
    // Atomically decrement, but only if quantity is sufficient
    product = await Product.findOneAndUpdate(
      { _id: productId, isActive: true, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: false } // return old doc so we know prevQty
    );
    if (!product) {
      // Check if product exists at all
      const exists = await Product.findOne({ _id: productId, isActive: true });
      if (!exists) {
        const err = new Error('Product not found or is archived.');
        err.statusCode = 404;
        throw err;
      }
      const err = new Error(
        `Insufficient stock. Available: ${exists.quantity} ${exists.unit}. Requested: ${quantity}`
      );
      err.statusCode = 400;
      throw err;
    }
  } else {
    // Stock In or positive adjustment
    product = await Product.findOneAndUpdate(
      { _id: productId, isActive: true },
      { $inc: { quantity } },
      { new: false }
    );
    if (!product) {
      const err = new Error('Product not found or is archived.');
      err.statusCode = 404;
      throw err;
    }
  }

  const prevQty = product.quantity;
  const newQty = type === MOVEMENT_TYPES.STOCK_OUT ? prevQty - quantity : prevQty + quantity;

  // Create movement record
  const movement = await StockMovement.create({
    product: productId,
    type,
    quantity,
    previousQuantity: prevQty,
    newQuantity: newQty,
    performedBy: userId,
    supplier: supplierId || null,
    referenceNo,
    notes,
  });

  // Reload product for current state
  const updatedProduct = await Product.findById(productId).populate([
    { path: 'category', select: 'name' },
    { path: 'supplier', select: 'name' },
  ]);

  // Trigger alert check (non-blocking)
  alertService.checkAndUpdateAlerts(updatedProduct).catch((alertErr) => {
    console.error('Alert check failed:', alertErr.message);
  });

  return { movement, product: updatedProduct };
};

const stockIn = async ({ productId, quantity, supplierId, referenceNo, notes, userId }) => {
  return performMovement({
    productId,
    type: MOVEMENT_TYPES.STOCK_IN,
    quantity,
    userId,
    supplierId,
    referenceNo,
    notes,
  });
};

const stockOut = async ({ productId, quantity, referenceNo, notes, userId }) => {
  return performMovement({
    productId,
    type: MOVEMENT_TYPES.STOCK_OUT,
    quantity,
    userId,
    referenceNo,
    notes,
  });
};

const adjustment = async ({ productId, quantity, type, notes, userId }) => {
  return performMovement({
    productId,
    type: type === 'STOCK_IN' ? MOVEMENT_TYPES.STOCK_IN : MOVEMENT_TYPES.STOCK_OUT,
    quantity,
    userId,
    notes,
    isAdjustment: true,
  });
};

const reverseMovement = async (movementId, userId) => {
  const original = await StockMovement.findById(movementId).populate('product');
  if (!original) {
    const err = new Error('Movement record not found.');
    err.statusCode = 404;
    throw err;
  }
  if (original.isReversed) {
    const err = new Error('This movement has already been reversed.');
    err.statusCode = 400;
    throw err;
  }

  // The reversal undoes the original: if original was STOCK_IN, reversal is STOCK_OUT
  const reversalType =
    original.type === MOVEMENT_TYPES.STOCK_IN ? MOVEMENT_TYPES.STOCK_OUT : MOVEMENT_TYPES.STOCK_IN;

  const result = await performMovement({
    productId: original.product._id,
    type: reversalType,
    quantity: original.quantity,
    userId,
    notes: `Reversal of movement ${movementId}`,
    isAdjustment: true,
  });

  // Mark original as reversed
  await StockMovement.findByIdAndUpdate(movementId, { isReversed: true });
  // Mark reversal record
  await StockMovement.findByIdAndUpdate(result.movement._id, { reversalOf: movementId });

  return result;
};

const getHistory = async ({ productId, userId, type, startDate, endDate, page = 1, limit = 20 }) => {
  const filter = {};
  if (productId) filter.product = productId;
  if (userId) filter.performedBy = userId;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const skip = (page - 1) * limit;
  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .populate({ path: 'product', select: 'name sku unit' })
      .populate({ path: 'performedBy', select: 'name email' })
      .populate({ path: 'supplier', select: 'name' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    StockMovement.countDocuments(filter),
  ]);

  return {
    movements,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const getSummary = async () => {
  const [totalIn, totalOut] = await Promise.all([
    StockMovement.aggregate([
      { $match: { type: MOVEMENT_TYPES.STOCK_IN } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
    StockMovement.aggregate([
      { $match: { type: MOVEMENT_TYPES.STOCK_OUT } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
  ]);
  return { totalStockIn: totalIn[0]?.total || 0, totalStockOut: totalOut[0]?.total || 0 };
};

module.exports = { stockIn, stockOut, adjustment, reverseMovement, getHistory, getSummary };
