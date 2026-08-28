const Order = require('../models/Order');
const Product = require('../models/Product');

// Create order (Customer)
exports.createOrder = async (req, res) => {

  try {

    const { items, deliveryAddress, vendorId, idempotencyKey } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Check for idempotency to prevent duplicate orders
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        return res.status(200).json({
          message: "Order already processed",
          order: existingOrder
        });
      }
    }
    
    let orderItems = [];
    let totalPrice = 0;

    for (const item of items) {

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Atomic stock decrement with guard pattern
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      const itemTotal = updatedProduct.price * item.quantity;

      totalPrice += itemTotal;

      orderItems.push({
        productId: item.productId,
        name: updatedProduct.name,
        quantity: item.quantity,
        price: updatedProduct.price
      });
    }

    // Create order with new structure
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const order = await Order.create({
      orderNumber,
      customerId: req.user._id,
      vendorId: vendorId, // Use vendorId from request
      items: orderItems,
      status: 'created',
      statusHistory: [{
        status: 'created',
        timestamp: new Date(),
        actorId: req.user._id
      }],
      pricing: {
        subtotal: totalPrice,
        deliveryFee: 0,
        serviceFee: 0,
        tax: 0,
        discount: 0,
        tip: 0,
        total: totalPrice,
        currency: 'USD'
      },
      deliveryAddress: {
        fullAddress: deliveryAddress
      },
      idempotencyKey: idempotencyKey || null
    });

    res.status(201).json({
      message: "Order created",
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pending orders (Rider)
exports.getPendingOrders = async (req, res) => {
  try {

    const orders = await Order.find({ status: 'pending' });

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rider accepts order
exports.acceptOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order already taken' });
    }

    order.status = 'accepted';
    order.riderId = req.user._id;

    await order.save();

    res.status(200).json({ message: 'Order accepted', order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add status history entry
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      actorId: req.user._id,
      notes: `Status changed from ${order.status} to ${status}`
    });

    order.status = status;

    await order.save();

    res.status(200).json({
      message: 'Status updated',
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id});
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({_message: error.message});
  }
};

exports.getMyDeliveries = async (req,res) => {
  try {
    const orders = await Order.find({ riderId: req.user._id});
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({_message: error.message});
  }
};

exports.getVendorOrders = async (req, res) => {
  try {
    const userVendorId = req.user.vendorId || req.user._id;
    const orders = await Order.find({ vendorId: userVendorId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({_message: error.message});
  }
};

