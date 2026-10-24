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
    enum: ['customer', 'rider', 'vendor_staff', 'admin', 'supermarket'],
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

  // Vendor/Supermarket specific fields
  branding: {
    storeName: String,
    storeSlug: String,
    storeCategory: String,
    businessBio: String,
    storeLogo: String,
    storeBanner: String
  },
  operations: {
    streetAddress: String,
    city: String,
    region: String,
    postalCode: String,
    phoneNumber: String,
    supportEmail: String,
    minimumOrderAmount: { type: Number, default: 0 },
    autoAcceptOrders: { type: Boolean, default: false },
    preparationTime: String,
    deliveryFee: Number,
    operatingHours: {
      monday: { open: Boolean, openTime: String, closeTime: String },
      tuesday: { open: Boolean, openTime: String, closeTime: String },
      wednesday: { open: Boolean, openTime: String, closeTime: String },
      thursday: { open: Boolean, openTime: String, closeTime: String },
      friday: { open: Boolean, openTime: String, closeTime: String },
      saturday: { open: Boolean, openTime: String, closeTime: String },
      sunday: { open: Boolean, openTime: String, closeTime: String }
    }
  },
  banking: {
    cbeAccounts: [{
      id: Number,
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      branchName: String,
      isPrimary: Boolean
    }],
    otherBankAccounts: [{
      id: Number,
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      branchName: String,
      isPrimary: Boolean
    }],
    telebirrAccounts: [{
      id: Number,
      phone: String,
      registeredName: String,
      isPrimary: Boolean
    }],
    otherWalletAccounts: [{
      id: Number,
      walletType: String,
      phone: String,
      registeredName: String,
      isPrimary: Boolean
    }],
    taxId: String,
    verificationDocument: String
  },

  // Vendor staff reference
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  supermarketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }
}, { timestamps: true });

// Index for geospatial rider queries
userSchema.index({ 'riderProfile.currentLocation': '2dsphere' });

module.exports = mongoose.model('User', userSchema);