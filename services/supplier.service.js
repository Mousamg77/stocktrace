const Supplier = require('../models/Supplier');

const getAll = async ({ includeInactive = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };
  return Supplier.find(filter).sort({ name: 1 });
};

const getById = async (id) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    const err = new Error('Supplier not found.');
    err.statusCode = 404;
    throw err;
  }
  return supplier;
};

const create = async (data) => {
  return Supplier.create(data);
};

const update = async (id, updates) => {
  const supplier = await Supplier.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!supplier) {
    const err = new Error('Supplier not found.');
    err.statusCode = 404;
    throw err;
  }
  return supplier;
};

module.exports = { getAll, getById, create, update };
