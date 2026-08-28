const express = require('express');
const router = express.Router();
const {
  createOrder,
  getPendingOrders,
  acceptOrder,
  updateOrderStatus,
  getMyOrders,
  getMyDeliveries,
  getVendorOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Customer creates order
router.post('/', protect, authorizeRoles('customer'), createOrder);

// Rider gets pending orders
router.get('/pending', protect, getPendingOrders);

// Get my orders/deliveries/vendor orders
router.get('/my-orders', protect, getMyOrders);
router.get('/my-deliveries', protect, getMyDeliveries);
router.get('/vendor-orders', protect, authorizeRoles('vendor_staff', 'admin'), getVendorOrders);

// Rider accepts order
router.put('/accept/:id', protect, authorizeRoles('rider'), acceptOrder);

// Update status (accepted → delivering → completed)
router.put('/status/:id', protect, authorizeRoles('rider'), updateOrderStatus);
router.put('/:id/accept', protect, authorizeRoles('rider'), acceptOrder);
router.put('/:id/status', protect, authorizeRoles('rider'), updateOrderStatus);


module.exports = router;