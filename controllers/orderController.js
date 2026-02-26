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