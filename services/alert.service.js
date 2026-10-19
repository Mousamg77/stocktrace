const Alert = require('../models/Alert');
const { ALERT_TYPES, ALERT_STATUS, EXPIRY_SOON_DAYS } = require('../config/constants');

/**
 * Creates or reactivates an alert. Resolves alerts that no longer apply.
 * Uses upsert pattern to avoid duplicate active alerts.
 */
const upsertAlert = async (productId, type, message) => {
  await Alert.findOneAndUpdate(
    { product: productId, type, status: ALERT_STATUS.ACTIVE },
    { product: productId, type, status: ALERT_STATUS.ACTIVE, message },
    { upsert: true, setDefaultsOnInsert: true }
  );
};

const resolveAlert = async (productId, type) => {
  await Alert.updateMany(
    { product: productId, type, status: ALERT_STATUS.ACTIVE },
    { status: ALERT_STATUS.RESOLVED, resolvedAt: new Date() }
  );
};

/**
 * Checks a product's current state and upserts or resolves alerts accordingly.
 */
const checkAndUpdateAlerts = async (product) => {
  // Stock alerts
  if (product.quantity === 0) {
    await upsertAlert(product._id, ALERT_TYPES.OUT_OF_STOCK, `${product.name} is out of stock.`);
    await resolveAlert(product._id, ALERT_TYPES.LOW_STOCK);
  } else if (product.quantity <= product.minThreshold) {
    await upsertAlert(product._id, ALERT_TYPES.LOW_STOCK, `${product.name} stock is low (${product.quantity} ${product.unit}).`);
    await resolveAlert(product._id, ALERT_TYPES.OUT_OF_STOCK);
  } else {
    await resolveAlert(product._id, ALERT_TYPES.LOW_STOCK);
    await resolveAlert(product._id, ALERT_TYPES.OUT_OF_STOCK);
  }

  // Expiry alerts
  if (product.expiryDate) {
    const now = new Date();
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + EXPIRY_SOON_DAYS);

    if (product.expiryDate < now) {
      await upsertAlert(product._id, ALERT_TYPES.EXPIRED, `${product.name} has expired.`);
      await resolveAlert(product._id, ALERT_TYPES.EXPIRY_SOON);
    } else if (product.expiryDate <= soonDate) {
      await upsertAlert(product._id, ALERT_TYPES.EXPIRY_SOON, `${product.name} expires on ${product.expiryDate.toDateString()}.`);
      await resolveAlert(product._id, ALERT_TYPES.EXPIRED);
    } else {
      await resolveAlert(product._id, ALERT_TYPES.EXPIRY_SOON);
      await resolveAlert(product._id, ALERT_TYPES.EXPIRED);
    }
  }
};

const getAlerts = async ({ type, status = ALERT_STATUS.ACTIVE, page = 1, limit = 20 } = {}) => {
  const filter = { status };
  if (type) filter.type = type;

  const skip = (page - 1) * limit;
  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .populate({ path: 'product', select: 'name sku quantity unit minThreshold expiryDate' })
      .populate({ path: 'resolvedBy', select: 'name email' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Alert.countDocuments(filter),
  ]);

  return {
    alerts,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const resolveAlertById = async (alertId, userId) => {
  const alert = await Alert.findByIdAndUpdate(
    alertId,
    { status: ALERT_STATUS.RESOLVED, resolvedBy: userId, resolvedAt: new Date() },
    { new: true }
  );
  if (!alert) {
    const err = new Error('Alert not found.');
    err.statusCode = 404;
    throw err;
  }
  return alert;
};

const getAlertCounts = async () => {
  const counts = await Alert.aggregate([
    { $match: { status: ALERT_STATUS.ACTIVE } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);
  const result = {};
  counts.forEach((c) => (result[c._id] = c.count));
  return result;
};

module.exports = { checkAndUpdateAlerts, getAlerts, resolveAlertById, getAlertCounts };
