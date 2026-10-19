const mongoose = require('mongoose');
const { EXPIRY_STATUS, EXPIRY_SOON_DAYS } = require('../config/constants');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, 'SKU cannot exceed 50 characters'],
    },
    qrId: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand cannot exceed 100 characters'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true,
      maxlength: [30, 'Unit cannot exceed 30 characters'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    minThreshold: {
      type: Number,
      required: [true, 'Minimum stock threshold is required'],
      min: [0, 'Minimum threshold cannot be negative'],
      default: 0,
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      min: [0, 'Selling price cannot be negative'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    batchNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Batch number cannot exceed 100 characters'],
    },
    mfgDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: inventory value
productSchema.virtual('inventoryValue').get(function () {
  return parseFloat((this.quantity * this.costPrice).toFixed(2));
});

// Virtual: stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.quantity === 0) return 'out_of_stock';
  if (this.quantity <= this.minThreshold) return 'low_stock';
  return 'in_stock';
});

// Virtual: expiry status
productSchema.virtual('expiryStatus').get(function () {
  if (!this.expiryDate) return EXPIRY_STATUS.NO_EXPIRY;
  const now = new Date();
  const soonDate = new Date();
  soonDate.setDate(soonDate.getDate() + EXPIRY_SOON_DAYS);
  if (this.expiryDate < now) return EXPIRY_STATUS.EXPIRED;
  if (this.expiryDate <= soonDate) return EXPIRY_STATUS.EXPIRING_SOON;
  return EXPIRY_STATUS.SAFE;
});

// Indexes for fast queries
productSchema.index({ sku: 1 });
productSchema.index({ qrId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ expiryDate: 1 });
productSchema.index({ name: 'text', sku: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
