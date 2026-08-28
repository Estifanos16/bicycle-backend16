const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    default: 'General'
  },
  subCategory: String,
  images: [{
    type: String
  }],
  price: {
    type: Number,
    required: true
  },
  compareAtPrice: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'each', 'pack', 'liter', 'dozen'],
    default: 'each'
  },
  sku: String,
  barcode: String,
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  substitutionAllowed: {
    type: Boolean,
    default: true
  },
  nutritionInfo: String,
  tags: [String]
}, { timestamps: true });

// Index for efficient vendor product lookups
productSchema.index({ vendorId: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' }); // For search

module.exports = mongoose.model('Product', productSchema);