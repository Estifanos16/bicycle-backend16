const express = require('express');
const router = express.Router();
const {
    createVendor,
    getVendors,
    getVendorById,
    getVendorByOwnerId,
    getUserBankingInfo,
    updateVendor,
    approveVendor,
    getNearbyVendors,
    deleteVendor,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all approved vendors
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: List of vendors retrieved successfully
 */
router.get('/', getVendors);

/**
 * @swagger
 * /api/vendors/nearby:
 *   get:
 *     summary: Get nearby vendors based on location
 *     tags: [Vendors]
 *     parameters:
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *           default: 10000
 *     responses:
 *       200:
 *         description: List of nearby vendors retrieved successfully
 *       400:
 *         description: Missing coordinates
 */
router.get('/nearby', getNearbyVendors);

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor retrieved successfully
 *       404:
 *         description: Vendor not found
 */
router.get('/:id', getVendorById);

/**
 * @swagger
 * /api/vendors/owner/{ownerId}:
 *   get:
 *     summary: Get vendor by owner ID (User ID)
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor retrieved successfully
 *       404:
 *         description: Vendor not found
 */
router.get('/owner/:ownerId', getVendorByOwnerId);

/**
 * @swagger
 * /api/vendors/user/{userId}/banking:
 *   get:
 *     summary: Get user banking info for checkout
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banking info retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/user/:userId/banking', getUserBankingInfo);

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create a new vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Vendor created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
router.post('/', protect, authorizeRoles('admin'), createVendor);

/**
 * @swagger
 * /api/vendors/{id}:
 *   put:
 *     summary: Update vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Vendor not found
 */
router.put('/:id', protect, updateVendor);

/**
 * @swagger
 * /api/vendors/{id}/approve:
 *   put:
 *     summary: Approve vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Vendor not found
 */
router.put('/:id/approve', protect, authorizeRoles('admin'), approveVendor);

/**
 * @swagger
 * /api/vendors/{id}:
 *   delete:
 *     summary: Delete vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Vendor not found
 */
router.delete('/:id', protect, authorizeRoles('admin'), deleteVendor);

module.exports = router;
