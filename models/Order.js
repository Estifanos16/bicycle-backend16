const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  substituteFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  status: {
    type: String,
    enum: ['ordered', 'confirmed', 'out_of_stock', 'substituted'],
    default: 'ordered'
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
});

const pricingSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  serviceFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tip: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'USD' }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    customerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    vendorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vendor',
      required: true 
    },
    riderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    items: [orderItemSchema],
    status: { 
      type: String, 
      enum: [
        'created',
        'payment_pending',
        'payment_confirmed',
        'vendor_accepted',
        'preparing',
        'ready_for_pickup',
        'rider_assigned',
        'rider_en_route_to_vendor',
        'picked_up',
        'en_route_to_customer',
        'delivered',
        'cancelled',
        'refunded',
        'failed_delivery',
        'returned'
      ],
      default: 'created'
    },
    statusHistory: [statusHistorySchema],
    pricing: {
      type: pricingSchema,
      required: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'Ethiopia' },
      fullAddress: { type: String, required: true }
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      }
    },
    vendorAcceptedAt: Date,
    readyAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    estimatedDeliveryTime: Date,
    proofOfDelivery: {
      type: {
        type: String,
        enum: ['photo', 'pin', 'signature']
      },
      value: String
    },
    cancellation: {
      reason: String,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      refundStatus: {
        type: String,
        enum: ['pending', 'processed', 'failed']
      }
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

// Index for efficient order lookups
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ riderId: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema); // ✅ Must export like this