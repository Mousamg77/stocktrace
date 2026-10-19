const mongoose = require('mongoose');
const { ALERT_TYPES, ALERT_STATUS } = require('../config/constants');

const alertSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ALERT_TYPES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ALERT_STATUS),
      default: ALERT_STATUS.ACTIVE,
    },
    message: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate active alerts for the same product+type combination
alertSchema.index(
  { product: 1, type: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: ALERT_STATUS.ACTIVE },
  }
);
alertSchema.index({ status: 1, type: 1 });
alertSchema.index({ product: 1 });

module.exports = mongoose.model('Alert', alertSchema);
