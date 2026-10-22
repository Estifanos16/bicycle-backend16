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
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [38.7578, 8.9638] // Default to Addis Ababa coordinates
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
      default: [[
        [38.7, 8.9],
        [38.8, 8.9],
        [38.8, 9.0],
        [38.7, 9.0],
        [38.7, 8.9]
      ]] // Default delivery zone around Addis Ababa
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

// Create geospatial index for location queries (sparse - optional)
vendorSchema.index({ location: '2dsphere' }, { sparse: true });

// Create index for delivery zone queries (sparse - optional)
vendorSchema.index({ deliveryZone: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Vendor', vendorSchema);
