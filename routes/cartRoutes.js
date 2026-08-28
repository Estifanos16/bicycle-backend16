const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  getUserCarts
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require authentication
router.get('/', protect, getUserCarts);
router.get('/vendor/:vendorId', protect, getCart);
router.post('/', protect, addToCart);
router.put('/item', protect, updateCartItem);
router.delete('/vendor/:vendorId/product/:productId', protect, removeFromCart);
router.delete('/vendor/:vendorId', protect, clearCart);
router.post('/coupon', protect, applyCoupon);

module.exports = router;
