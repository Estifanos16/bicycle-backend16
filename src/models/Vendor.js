const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Ethiopia' }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  deliveryZone: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]],
      default: []
    }
  },
  commissionRate: {
    type: Number,
    default: 0.15, // 15% platform commission
    min: 0,
    max: 1
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    open: {
      type: String,
      required: true // Format: "HH:mm"
    },
    close: {
      type: String,
      required: true // Format: "HH:mm"
    }
  }],
  isOpen: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
vendorSchema.index({ location: '2dsphere' });

// Create index for delivery zone queries
vendorSchema.index({ deliveryZone: '2dsphere' });

module.exports = mongoose.model('Vendor', vendorSchema);
