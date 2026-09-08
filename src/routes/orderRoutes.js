const express = require('express');
const router = express.Router();
const {
    createOrder,
    getPendingOrders,
    acceptOrder,
    updateOrderStatus,
    getMyOrders,
    getMyDeliveries,
    getVendorOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('customer'), createOrder);
router.get('/pending', protect, getPendingOrders);
router.get('/my-orders', protect, getMyOrders);
router.get('/my-deliveries', protect, getMyDeliveries);
router.get('/vendor-orders', protect, authorizeRoles('vendor_staff', 'admin'), getVendorOrders);
router.put('/accept/:id', protect, authorizeRoles('rider'), acceptOrder);
router.put('/status/:id', protect, authorizeRoles('rider'), updateOrderStatus);
router.put('/:id/accept', protect, authorizeRoles('rider'), acceptOrder);
router.put('/:id/status', protect, authorizeRoles('rider'), updateOrderStatus);

module.exports = router;
