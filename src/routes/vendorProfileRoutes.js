const express = require('express');
const router = express.Router();
const { updateVendorProfile, getVendorProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/vendor/profile:
 *   get:
 *     summary: Get vendor profile
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not a vendor
 */
router.get('/profile', protect, getVendorProfile);

/**
 * @swagger
 * /api/vendor/profile:
 *   put:
 *     summary: Update vendor profile
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branding:
 *                 type: object
 *               operations:
 *                 type: object
 *               banking:
 *                 type: object
 *     responses:
 *       200:
 *         description: Vendor profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not a vendor
 */
router.put('/profile', protect, updateVendorProfile);

module.exports = router;
