const Product = require('../models/Product');
const { generateQrId } = require('../utils/qrId');

const POPULATE_OPTS = [
  { path: 'category', select: 'name' },
  { path: 'supplier', select: 'name' },
  { path: 'createdBy', select: 'name email' },
];

const buildFilter = ({ search, category, supplier, stockStatus, expiryStatus, isActive }) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
  else filter.isActive = true;

  if (category) filter.category = category;
  if (supplier) filter.supplier = supplier;
  if (search) filter.$text = { $search: search };

  // Stock status filter
  if (stockStatus === 'out_of_stock') filter.quantity = 0;
  else if (stockStatus === 'low_stock') filter.$expr = { $lte: ['$quantity', '$minThreshold'] };
  else if (stockStatus === 'in_stock') filter.$expr = { $gt: ['$quantity', '$minThreshold'] };

  // Expiry status filter
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  if (expiryStatus === 'expired') filter.expiryDate = { $lt: now };
  else if (expiryStatus === 'expiring_soon') filter.expiryDate = { $gte: now, $lte: soon };
  else if (expiryStatus === 'safe') filter.$or = [{ expiryDate: { $gt: soon } }, { expiryDate: null }];

  return filter;
};

const getAll = async ({ search, category, supplier, stockStatus, expiryStatus, isActive, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = {}) => {
  const filter = buildFilter({ search, category, supplier, stockStatus, expiryStatus, isActive });
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter).populate(POPULATE_OPTS).sort(sort).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  };
};

const getById = async (id) => {
  const product = await Product.findById(id).populate(POPULATE_OPTS);
  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

const getByQrId = async (qrId) => {
  const product = await Product.findOne({ qrId }).populate(POPULATE_OPTS);
  if (!product) {
    const err = new Error('Product not found for this QR code. It may have been archived.');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

const create = async (data, userId) => {
  const existing = await Product.findOne({ sku: data.sku.toUpperCase() });
  if (existing) {
    const err = new Error(`A product with SKU "${data.sku.toUpperCase()}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  const qrId = generateQrId();
  const product = await Product.create({ ...data, qrId, createdBy: userId });
  return product.populate(POPULATE_OPTS);
};

const update = async (id, updates) => {
  // Prevent SKU from being changed to a duplicate
  if (updates.sku) {
    const existing = await Product.findOne({ sku: updates.sku.toUpperCase(), _id: { $ne: id } });
    if (existing) {
      const err = new Error(`A product with SKU "${updates.sku.toUpperCase()}" already exists.`);
      err.statusCode = 409;
      throw err;
    }
    updates.sku = updates.sku.toUpperCase();
  }

  // Never allow direct quantity modification through product update
  delete updates.quantity;
  delete updates.qrId;
  delete updates.createdBy;

  const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate(POPULATE_OPTS);
  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

const archive = async (id) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).populate(POPULATE_OPTS);
  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

module.exports = { getAll, getById, getByQrId, create, update, archive };
