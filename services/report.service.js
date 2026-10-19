const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { EXPIRY_SOON_DAYS } = require('../config/constants');

const getInventorySummary = async ({ category } = {}) => {
  const match = { isActive: true };
  if (category) match.category = require('mongoose').Types.ObjectId.createFromHexString(category);

  return Product.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
        totalUnits: { $sum: '$quantity' },
        lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$minThreshold'] }] }, 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } },
      },
    },
  ]);
};

const getValuationReport = async ({ category } = {}) => {
  const match = { isActive: true };
  if (category) match.category = require('mongoose').Types.ObjectId.createFromHexString(category);

  return Product.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: { path: '$categoryInfo', preserveNullAndEmpty: true } },
    {
      $project: {
        name: 1,
        sku: 1,
        quantity: 1,
        unit: 1,
        costPrice: 1,
        sellingPrice: 1,
        inventoryValue: { $multiply: ['$quantity', '$costPrice'] },
        category: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
      },
    },
    { $sort: { inventoryValue: -1 } },
  ]);
};

const getStockMovementsReport = async ({ startDate, endDate, type, page = 1, limit = 50 }) => {
  const match = {};
  if (type) match.type = type;
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  const skip = (page - 1) * limit;
  const [movements, total] = await Promise.all([
    StockMovement.find(match)
      .populate({ path: 'product', select: 'name sku unit' })
      .populate({ path: 'performedBy', select: 'name email' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    StockMovement.countDocuments(match),
  ]);

  return { movements, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

const getExpiryReport = async () => {
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + EXPIRY_SOON_DAYS);

  return Product.find({
    isActive: true,
    expiryDate: { $ne: null },
  })
    .populate({ path: 'category', select: 'name' })
    .sort({ expiryDate: 1 });
};

const getLowStockReport = async () => {
  return Product.find({
    isActive: true,
    $expr: { $lte: ['$quantity', '$minThreshold'] },
  })
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'supplier', select: 'name' })
    .sort({ quantity: 1 });
};

module.exports = {
  getInventorySummary,
  getValuationReport,
  getStockMovementsReport,
  getExpiryReport,
  getLowStockReport,
};
