const Order = require('../models/Order');

// Create order (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, deliveryAddress, supermarketId } = req.body;

    const order = await Order.create({
      customerId: req.user._id,
      supermarketId,
      items,
      totalPrice,
      deliveryAddress
    });

    res.status(201).json({ message: 'Order created', order });
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

    order.status = status;

    await order.save();

    res.status(200).json({ message: 'Status updated', order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};