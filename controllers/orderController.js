const Order = require('../models/Order');
const Product = require('../models/Product');

// Create order (Customer)
exports.createOrder = async (req, res) => {

  try {

    const { items, deliveryAddress, supermarketId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }
    
    let orderItems = [];
    let totalPrice = 0;

    for (const item of items) {

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      const itemTotal = product.price * item.quantity;

      totalPrice += itemTotal;

      orderItems.push({
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });

    // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      customerId: req.user._id,
      supermarketId,
      items: orderItems,
      totalPrice,
      deliveryAddress
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

exports.getSupermarketOrders = async (req, res) => {
  try {
    const orders = await Order.find({ supermarketId: req.user._id });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({_message: error.message});
  }
};

