const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: 'Ethiopia' },
  isDefault: { type: Boolean, default: false }
});

const riderProfileSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: ['bike', 'moto', 'car'],
    default: 'bike'
  },
  isOnline: { type: Boolean, default: false },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  completedDeliveries: { type: Number, default: 0 },
  documentsVerified: { type: Boolean, default: false },
  payoutAccountId: String
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  roles: {
    type: [String],
    enum: ['customer', 'rider', 'vendor_staff', 'admin'],
    default: ['customer']
  },
  phone: String,
  addresses: [addressSchema],
  defaultAddressId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  lastLoginAt: Date,
  
  // Rider-specific profile
  riderProfile: riderProfileSchema,
  
  // Vendor staff reference
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }
}, { timestamps: true });

// Index for geospatial rider queries
userSchema.index({ 'riderProfile.currentLocation': '2dsphere' });

module.exports = mongoose.model('User', userSchema);