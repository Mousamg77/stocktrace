const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Alert = require('../models/Alert');
const { ALERT_STATUS, EXPIRY_SOON_DAYS } = require('../config/constants');

const getDashboardKPIs = async () => {
  const now = new Date();
  const soonDate = new Date();
  soonDate.setDate(soonDate.getDate() + EXPIRY_SOON_DAYS);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProducts,
    outOfStock,
    lowStock,
    expiringProducts,
    expiredProducts,
    inventoryValue,
    monthlyIn,
    monthlyOut,
    totalUnits,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, quantity: 0 }),
    Product.countDocuments({ isActive: true, $expr: { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$minThreshold'] }] } }),
    Product.countDocuments({ isActive: true, expiryDate: { $gte: now, $lte: soonDate } }),
    Product.countDocuments({ isActive: true, expiryDate: { $lt: now } }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$costPrice'] } } } },
    ]),
    StockMovement.aggregate([
      { $match: { type: 'STOCK_IN', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
    StockMovement.aggregate([
      { $match: { type: 'STOCK_OUT', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
  ]);

  return {
    totalProducts,
    totalUnits: totalUnits[0]?.total || 0,
    outOfStock,
    lowStock,
    expiringProducts,
    expiredProducts,
    inventoryValue: parseFloat((inventoryValue[0]?.total || 0).toFixed(2)),
    monthlyStockIn: monthlyIn[0]?.total || 0,
    monthlyStockOut: monthlyOut[0]?.total || 0,
  };
};

const getStockChart = async (days = 30) => {
  const start = new Date();
  start.setDate(start.getDate() - days);

  const data = await StockMovement.aggregate([
    { $match: { createdAt: { $gte: start }, type: { $in: ['STOCK_IN', 'STOCK_OUT'] } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$type',
        },
        total: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // Pivot into { date, stockIn, stockOut }
  const dateMap = {};
  data.forEach(({ _id: { date, type }, total }) => {
    if (!dateMap[date]) dateMap[date] = { date, stockIn: 0, stockOut: 0 };
    if (type === 'STOCK_IN') dateMap[date].stockIn = total;
    else dateMap[date].stockOut = total;
  });

  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
};

const getCategoryDistribution = async () => {
  return Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalQty: { $sum: '$quantity' },
        value: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
      },
    },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: ['$category.name', 'Uncategorized'] }, count: 1, totalQty: 1, value: 1 } },
    { $sort: { count: -1 } },
  ]);
};

const getTopMovedProducts = async (limit = 5) => {
  return StockMovement.aggregate([
    { $group: { _id: '$product', totalMoves: { $sum: '$quantity' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $project: { 'product.name': 1, 'product.sku': 1, 'product.unit': 1, totalMoves: 1, count: 1 } },
  ]);
};

const getRecentMovements = async (limit = 10) => {
  return StockMovement.find()
    .populate({ path: 'product', select: 'name sku unit' })
    .populate({ path: 'performedBy', select: 'name' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getRecentProducts = async (limit = 5) => {
  return Product.find({ isActive: true })
    .populate({ path: 'category', select: 'name' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = {
  getDashboardKPIs,
  getStockChart,
  getCategoryDistribution,
  getTopMovedProducts,
  getRecentMovements,
  getRecentProducts,
};
