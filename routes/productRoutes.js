const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct, 
  getProductById, 
  getProductsByVendor,
  getMyVendorProducts 
} = require('../controllers/ProductController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload'); 

// Get products belonging strictly to the logged-in vendor (MUST be before /vendor/:vendorId)
router.get('/vendor/mine', protect, authorizeRoles('supermarket', 'vendor_staff', 'admin'), getMyVendorProducts);

// Get products by vendor ID (dynamic parameter - must come after static routes)
router.get('/vendor/:vendorId', getProductsByVendor);

// Get all products (supports ?vendorId= query parameter, or auto-scopes if vendor logged in)
router.get('/', optionalProtect, getProducts);

// Protected vendor CRUD routes
router.post('/', protect, authorizeRoles('supermarket', 'vendor_staff', 'admin'), upload.single('image'), createProduct);
router.put('/:id', protect, authorizeRoles('supermarket', 'vendor_staff', 'admin'), upload.single('image'), updateProduct);
router.delete('/:id', protect, authorizeRoles('supermarket', 'vendor_staff', 'admin'), deleteProduct);

// Get single product
router.get('/:id', getProductById);

module.exports = router;