const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtAdd: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true // One vendor per cart
  },
  items: [cartItemSchema],
  couponCode: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient user cart lookups
cartSchema.index({ userId: 1 });

// Ensure one cart per user per vendor
cartSchema.index({ userId: 1, vendorId: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
