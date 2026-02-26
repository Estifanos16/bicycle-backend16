const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supermarketId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{ name: String, quantity: Number, price: Number }],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'delivering', 'completed'], default: 'pending' },
    deliveryAddress: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema); // ✅ Must export like this