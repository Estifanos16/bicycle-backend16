const express = require('express');
const router = express.Router();

const {
  createOrder,
  getPendingOrders,
  acceptOrder,
  updateOrderStatus
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

// Customer creates order
router.post('/', protect, createOrder);

// Rider gets pending orders
router.get('/pending', protect, getPendingOrders);

// Rider accepts order
router.put('/accept/:id', protect, acceptOrder);

// Update status (accepted → delivering → completed)
router.put('/status/:id', protect, updateOrderStatus);

module.exports = router;