const express = require('express');
const router = express.Router();
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  approveVendor,
  getNearbyVendors,
  deleteVendor
} = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getVendors);
router.get('/nearby', getNearbyVendors);
router.get('/:id', getVendorById);

// Protected routes
router.post('/', protect, authorizeRoles('admin'), createVendor);
router.put('/:id', protect, updateVendor);
router.put('/:id/approve', protect, authorizeRoles('admin'), approveVendor);
router.delete('/:id', protect, authorizeRoles('admin'), deleteVendor);

module.exports = router;
