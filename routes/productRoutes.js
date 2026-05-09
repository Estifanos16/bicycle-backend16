const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/ProductController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware'); 

// Supermarket adds product
router.post('/', protect, authorizeRoles('supermarket'), createProduct);
router.put('/:id', protect, authorizeRoles('supermarket'), updateProduct);
router.delete('/:id', protect, authorizeRoles('supermarket'), deleteProduct);

// Get all products
router.get('/', getProducts);

module.exports = router;