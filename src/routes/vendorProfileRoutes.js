const express = require('express');
const router = express.Router();
const {
  updateVendorProfile,
  getVendorProfile,
  updateBranding,
  updateOperations,
  updateBanking,
  updateCbeAccount,
  deleteCbeAccount,
  updateOtherBankAccount,
  deleteOtherBankAccount,
  updateTelebirrAccount,
  deleteTelebirrAccount,
  updateOtherWalletAccount,
  deleteOtherWalletAccount
} = require('../controllers/authController');
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
 *     summary: Update vendor profile (all fields)
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

/**
 * @swagger
 * /api/vendor/branding:
 *   put:
 *     summary: Update branding
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
 *               storeName:
 *                 type: string
 *               storeSlug:
 *                 type: string
 *               storeCategory:
 *                 type: string
 *               businessBio:
 *                 type: string
 *               storeLogo:
 *                 type: string
 *               storeBanner:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branding updated successfully
 */
router.put('/branding', protect, updateBranding);

/**
 * @swagger
 * /api/vendor/operations:
 *   put:
 *     summary: Update operations
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
 *               streetAddress:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               supportEmail:
 *                 type: string
 *               minimumOrderAmount:
 *                 type: number
 *               autoAcceptOrders:
 *                 type: boolean
 *               preparationTime:
 *                 type: string
 *               deliveryFee:
 *                 type: number
 *               operatingHours:
 *                 type: object
 *     responses:
 *       200:
 *         description: Operations updated successfully
 */
router.put('/operations', protect, updateOperations);

/**
 * @swagger
 * /api/vendor/banking:
 *   put:
 *     summary: Update banking
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
 *               cbeAccounts:
 *                 type: array
 *               otherBankAccounts:
 *                 type: array
 *               telebirrAccounts:
 *                 type: array
 *               otherWalletAccounts:
 *                 type: array
 *               taxId:
 *                 type: string
 *               verificationDocument:
 *                 type: string
 *     responses:
 *       200:
 *         description: Banking updated successfully
 */
router.put('/banking', protect, updateBanking);

/**
 * @swagger
 * /api/vendor/banking/cbe:
 *   put:
 *     summary: Update or add CBE account
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
 *               accountId:
 *                 type: number
 *               accountHolderName:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               branchName:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: CBE account updated successfully
 */
router.put('/banking/cbe', protect, updateCbeAccount);

/**
 * @swagger
 * /api/vendor/banking/cbe/{accountId}:
 *   delete:
 *     summary: Delete CBE account
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CBE account deleted successfully
 */
router.delete('/banking/cbe/:accountId', protect, deleteCbeAccount);

/**
 * @swagger
 * /api/vendor/banking/other:
 *   put:
 *     summary: Update or add other bank account
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
 *               accountId:
 *                 type: number
 *               accountHolderName:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               branchName:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Other bank account updated successfully
 */
router.put('/banking/other', protect, updateOtherBankAccount);

/**
 * @swagger
 * /api/vendor/banking/other/{accountId}:
 *   delete:
 *     summary: Delete other bank account
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Other bank account deleted successfully
 */
router.delete('/banking/other/:accountId', protect, deleteOtherBankAccount);

/**
 * @swagger
 * /api/vendor/banking/telebirr:
 *   put:
 *     summary: Update or add Telebirr account
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
 *               accountId:
 *                 type: number
 *               phone:
 *                 type: string
 *               registeredName:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Telebirr account updated successfully
 */
router.put('/banking/telebirr', protect, updateTelebirrAccount);

/**
 * @swagger
 * /api/vendor/banking/telebirr/{accountId}:
 *   delete:
 *     summary: Delete Telebirr account
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Telebirr account deleted successfully
 */
router.delete('/banking/telebirr/:accountId', protect, deleteTelebirrAccount);

/**
 * @swagger
 * /api/vendor/banking/wallet:
 *   put:
 *     summary: Update or add other wallet account
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
 *               accountId:
 *                 type: number
 *               walletType:
 *                 type: string
 *               phone:
 *                 type: string
 *               registeredName:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Other wallet account updated successfully
 */
router.put('/banking/wallet', protect, updateOtherWalletAccount);

/**
 * @swagger
 * /api/vendor/banking/wallet/{accountId}:
 *   delete:
 *     summary: Delete other wallet account
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Other wallet account deleted successfully
 */
router.delete('/banking/wallet/:accountId', protect, deleteOtherWalletAccount);

module.exports = router;
