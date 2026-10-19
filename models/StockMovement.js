const mongoose = require('mongoose');
const { MOVEMENT_TYPES } = require('../config/constants');

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MOVEMENT_TYPES),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be positive'],
    },
    previousQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    newQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    referenceNo: {
      type: String,
      trim: true,
      maxlength: [100, 'Reference number cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    // For reversal support
    reversalOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockMovement',
    },
    isReversed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ performedBy: 1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ referenceNo: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
