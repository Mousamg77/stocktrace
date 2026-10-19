const Category = require('../models/Category');
const Product = require('../models/Product');

const getAll = async ({ includeInactive = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };
  return Category.find(filter).sort({ name: 1 });
};

const getById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const err = new Error('Category not found.');
    err.statusCode = 404;
    throw err;
  }
  return category;
};

const create = async ({ name, description }) => {
  const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (existing) {
    const err = new Error('A category with this name already exists.');
    err.statusCode = 409;
    throw err;
  }
  return Category.create({ name, description });
};

const update = async (id, updates) => {
  if (updates.name) {
    const existing = await Category.findOne({
      name: new RegExp(`^${updates.name}$`, 'i'),
      _id: { $ne: id },
    });
    if (existing) {
      const err = new Error('A category with this name already exists.');
      err.statusCode = 409;
      throw err;
    }
  }

  if (updates.isActive === false) {
    const productCount = await Product.countDocuments({ category: id, isActive: true });
    if (productCount > 0) {
      const err = new Error(
        `Cannot deactivate this category — ${productCount} active product(s) are assigned to it.`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!category) {
    const err = new Error('Category not found.');
    err.statusCode = 404;
    throw err;
  }
  return category;
};

module.exports = { getAll, getById, create, update };
