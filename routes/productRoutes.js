const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct, getProductById, getProductsByVendor } = require('../controllers/ProductController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware'); 

// Vendor staff adds product
router.post('/', protect, authorizeRoles('vendor_staff', 'admin'), createProduct);
router.put('/:id', protect, authorizeRoles('vendor_staff', 'admin'), updateProduct);
router.delete('/:id', protect, authorizeRoles('vendor_staff', 'admin'), deleteProduct);

// Get all products
router.get('/', getProducts);

// Get products by vendor (must come before :id route)
router.get('/vendor/:vendorId', getProductsByVendor);

// Get single product
router.get('/:id', getProductById);

module.exports = router;