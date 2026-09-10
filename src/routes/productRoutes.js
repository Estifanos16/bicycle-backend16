const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByVendor,
    getMyVendorProducts,
} = require('../controllers/productController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get products belonging strictly to the logged-in vendor (MUST be before /vendor/:vendorId)
router.get('/vendor/mine', protect, authorizeRoles('supermarket', 'vendor_staff', 'admin'), getMyVendorProducts);

// Get products by vendor ID (dynamic — must come after static routes)
router.get('/vendor/:vendorId', getProductsByVendor);

// Get all products (supports ?vendorId= or auto-scopes if vendor is logged in)
router.get('/', optionalProtect, getProducts);

// Protected vendor CRUD routes
router.post('/', protect, authorizeRoles('supermarket', 'vendor_staff', 'admin'), upload.array, createProduct);
router.put('/:id', protect, authorizeRoles('supermarket', 'vendor_staff', 'admin'), upload.array, updateProduct);
router.delete('/:id', protect, authorizeRoles('supermarket', 'vendor_staff', 'admin'), deleteProduct);

// Get single product
router.get('/:id', getProductById);

module.exports = router;
