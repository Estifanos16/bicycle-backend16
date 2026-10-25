const User = require('../models/User');
const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// UPDATE VENDOR PROFILE
exports.updateVendorProfile = async (req, res) => {
  try {
    const { branding, operations, banking } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is a vendor/supermarket
    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    // Update vendor profile fields in User document
    if (branding) {
      user.branding = { ...user.branding, ...branding };
      // Also update the user's name if storeName is provided
      if (branding.storeName) {
        user.name = branding.storeName;
      }
    }
    if (operations) {
      user.operations = { ...user.operations, ...operations };
    }
    if (banking) {
      user.banking = { ...user.banking, ...banking };
    }

    await user.save();

    // Also update the linked Vendor document if it exists
    const vendorId = user.vendorId || user.supermarketId;
    if (vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (vendor) {
        // Sync vendor name with store name from branding
        if (branding && branding.storeName) {
          vendor.name = branding.storeName;
        }
        // Sync vendor description with business bio from branding
        if (branding && branding.businessBio) {
          vendor.description = branding.businessBio;
        }
        // Sync vendor address with operations address
        if (operations) {
          if (operations.streetAddress || operations.city || operations.region || operations.postalCode) {
            vendor.address = {
              street: operations.streetAddress || vendor.address?.street || '',
              city: operations.city || vendor.address?.city || '',
              state: operations.region || vendor.address?.state || '',
              zipCode: operations.postalCode || vendor.address?.zipCode || '',
              country: vendor.address?.country || 'Ethiopia'
            };
          }
        }
        await vendor.save();
      }
    }

    res.status(200).json({
      message: 'Vendor profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        branding: user.branding,
        operations: user.operations,
        banking: user.banking
      }
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// GET VENDOR PROFILE
exports.getVendorProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is a vendor/supermarket
    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can view their profile.' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        branding: user.branding || {},
        operations: user.operations || {},
        banking: user.banking || {}
      }
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// UPDATE BRANDING
exports.updateBranding = async (req, res) => {
  try {
    const { storeName, storeSlug, storeCategory, businessBio, storeLogo, storeBanner } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    // Initialize branding if it doesn't exist
    if (!user.branding) {
      user.branding = {};
    }

    // Update only provided fields
    if (storeName !== undefined) user.branding.storeName = storeName;
    if (storeSlug !== undefined) user.branding.storeSlug = storeSlug;
    if (storeCategory !== undefined) user.branding.storeCategory = storeCategory;
    if (businessBio !== undefined) user.branding.businessBio = businessBio;
    if (storeLogo !== undefined) user.branding.storeLogo = storeLogo;
    if (storeBanner !== undefined) user.branding.storeBanner = storeBanner;

    await user.save();

    // Sync to Vendor document
    const vendorId = user.vendorId || user.supermarketId;
    if (vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (vendor) {
        if (storeName) vendor.name = storeName;
        if (businessBio) vendor.description = businessBio;
        await vendor.save();
      }
    }

    res.status(200).json({
      message: 'Branding updated successfully',
      branding: user.branding
    });
  } catch (error) {
    console.error('Update branding error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// UPDATE OPERATIONS
exports.updateOperations = async (req, res) => {
  try {
    const { streetAddress, city, region, postalCode, phoneNumber, supportEmail, minimumOrderAmount, autoAcceptOrders, preparationTime, deliveryFee, operatingHours } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    // Initialize operations if it doesn't exist
    if (!user.operations) {
      user.operations = {};
    }

    // Update only provided fields
    if (streetAddress !== undefined) user.operations.streetAddress = streetAddress;
    if (city !== undefined) user.operations.city = city;
    if (region !== undefined) user.operations.region = region;
    if (postalCode !== undefined) user.operations.postalCode = postalCode;
    if (phoneNumber !== undefined) user.operations.phoneNumber = phoneNumber;
    if (supportEmail !== undefined) user.operations.supportEmail = supportEmail;
    if (minimumOrderAmount !== undefined) user.operations.minimumOrderAmount = minimumOrderAmount;
    if (autoAcceptOrders !== undefined) user.operations.autoAcceptOrders = autoAcceptOrders;
    if (preparationTime !== undefined) user.operations.preparationTime = preparationTime;
    if (deliveryFee !== undefined) user.operations.deliveryFee = deliveryFee;
    if (operatingHours !== undefined) user.operations.operatingHours = operatingHours;

    await user.save();

    // Sync to Vendor document
    const vendorId = user.vendorId || user.supermarketId;
    if (vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (vendor) {
        if (streetAddress || city || region || postalCode) {
          vendor.address = {
            street: streetAddress || vendor.address?.street || '',
            city: city || vendor.address?.city || '',
            state: region || vendor.address?.state || '',
            zipCode: postalCode || vendor.address?.zipCode || '',
            country: vendor.address?.country || 'Ethiopia'
          };
        }
        await vendor.save();
      }
    }

    res.status(200).json({
      message: 'Operations updated successfully',
      operations: user.operations
    });
  } catch (error) {
    console.error('Update operations error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// UPDATE BANKING
exports.updateBanking = async (req, res) => {
  try {
    const { cbeAccounts, otherBankAccounts, telebirrAccounts, otherWalletAccounts, taxId, verificationDocument } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    // Initialize banking if it doesn't exist
    if (!user.banking) {
      user.banking = {};
    }

    // Update only provided fields
    if (cbeAccounts !== undefined) user.banking.cbeAccounts = cbeAccounts;
    if (otherBankAccounts !== undefined) user.banking.otherBankAccounts = otherBankAccounts;
    if (telebirrAccounts !== undefined) user.banking.telebirrAccounts = telebirrAccounts;
    if (otherWalletAccounts !== undefined) user.banking.otherWalletAccounts = otherWalletAccounts;
    if (taxId !== undefined) user.banking.taxId = taxId;
    if (verificationDocument !== undefined) user.banking.verificationDocument = verificationDocument;

    await user.save();

    res.status(200).json({
      message: 'Banking updated successfully',
      banking: user.banking
    });
  } catch (error) {
    console.error('Update banking error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// UPDATE CBE ACCOUNT
exports.updateCbeAccount = async (req, res) => {
  try {
    const { accountId, accountHolderName, bankName, accountNumber, branchName, isPrimary } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    if (!user.banking) {
      user.banking = {};
    }
    if (!user.banking.cbeAccounts) {
      user.banking.cbeAccounts = [];
    }

    // Find and update the account by id
    const accountIndex = user.banking.cbeAccounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex !== -1) {
      // Update existing account
      if (accountHolderName !== undefined) user.banking.cbeAccounts[accountIndex].accountHolderName = accountHolderName;
      if (bankName !== undefined) user.banking.cbeAccounts[accountIndex].bankName = bankName;
      if (accountNumber !== undefined) user.banking.cbeAccounts[accountIndex].accountNumber = accountNumber;
      if (branchName !== undefined) user.banking.cbeAccounts[accountIndex].branchName = branchName;
      if (isPrimary !== undefined) user.banking.cbeAccounts[accountIndex].isPrimary = isPrimary;
    } else {
      // Add new account
      const newId = user.banking.cbeAccounts.length > 0 
        ? Math.max(...user.banking.cbeAccounts.map(acc => acc.id)) + 1 
        : 1;
      user.banking.cbeAccounts.push({
        id: newId,
        accountHolderName: accountHolderName || '',
        bankName: bankName || 'cbe',
        accountNumber: accountNumber || '',
        branchName: branchName || '',
        isPrimary: isPrimary || false
      });
    }

    await user.save();

    res.status(200).json({
      message: 'CBE account updated successfully',
      cbeAccounts: user.banking.cbeAccounts
    });
  } catch (error) {
    console.error('Update CBE account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// DELETE CBE ACCOUNT
exports.deleteCbeAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    if (user.banking && user.banking.cbeAccounts) {
      user.banking.cbeAccounts = user.banking.cbeAccounts.filter(acc => acc.id !== parseInt(accountId));
      await user.save();
    }

    res.status(200).json({
      message: 'CBE account deleted successfully',
      cbeAccounts: user.banking?.cbeAccounts || []
    });
  } catch (error) {
    console.error('Delete CBE account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// UPDATE OTHER BANK ACCOUNT
exports.updateOtherBankAccount = async (req, res) => {
  try {
    const { accountId, accountHolderName, bankName, accountNumber, branchName, isPrimary } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    if (!user.banking) {
      user.banking = {};
    }
    if (!user.banking.otherBankAccounts) {
      user.banking.otherBankAccounts = [];
    }

    const accountIndex = user.banking.otherBankAccounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex !== -1) {
      if (accountHolderName !== undefined) user.banking.otherBankAccounts[accountIndex].accountHolderName = accountHolderName;
      if (bankName !== undefined) user.banking.otherBankAccounts[accountIndex].bankName = bankName;
      if (accountNumber !== undefined) user.banking.otherBankAccounts[accountIndex].accountNumber = accountNumber;
      if (branchName !== undefined) user.banking.otherBankAccounts[accountIndex].branchName = branchName;
      if (isPrimary !== undefined) user.banking.otherBankAccounts[accountIndex].isPrimary = isPrimary;
    } else {
      const newId = user.banking.otherBankAccounts.length > 0 
        ? Math.max(...user.banking.otherBankAccounts.map(acc => acc.id)) + 1 
        : 1;
      user.banking.otherBankAccounts.push({
        id: newId,
        accountHolderName: accountHolderName || '',
        bankName: bankName || '',
        accountNumber: accountNumber || '',
        branchName: branchName || '',
        isPrimary: isPrimary || false
      });
    }

    await user.save();

    res.status(200).json({
      message: 'Other bank account updated successfully',
      otherBankAccounts: user.banking.otherBankAccounts
    });
  } catch (error) {
    console.error('Update other bank account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// DELETE OTHER BANK ACCOUNT
exports.deleteOtherBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    if (user.banking && user.banking.otherBankAccounts) {
      user.banking.otherBankAccounts = user.banking.otherBankAccounts.filter(acc => acc.id !== parseInt(accountId));
      await user.save();
    }

    res.status(200).json({
      message: 'Other bank account deleted successfully',
      otherBankAccounts: user.banking?.otherBankAccounts || []
    });
  } catch (error) {
    console.error('Delete other bank account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// UPDATE TELEBIRR ACCOUNT
exports.updateTelebirrAccount = async (req, res) => {
  try {
    const { accountId, phone, registeredName, isPrimary } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    if (!user.banking) {
      user.banking = {};
    }
    if (!user.banking.telebirrAccounts) {
      user.banking.telebirrAccounts = [];
    }

    const accountIndex = user.banking.telebirrAccounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex !== -1) {
      if (phone !== undefined) user.banking.telebirrAccounts[accountIndex].phone = phone;
      if (registeredName !== undefined) user.banking.telebirrAccounts[accountIndex].registeredName = registeredName;
      if (isPrimary !== undefined) user.banking.telebirrAccounts[accountIndex].isPrimary = isPrimary;
    } else {
      const newId = user.banking.telebirrAccounts.length > 0 
        ? Math.max(...user.banking.telebirrAccounts.map(acc => acc.id)) + 1 
        : 1;
      user.banking.telebirrAccounts.push({
        id: newId,
        phone: phone || '',
        registeredName: registeredName || '',
        isPrimary: isPrimary || false
      });
    }

    await user.save();

    res.status(200).json({
      message: 'Telebirr account updated successfully',
      telebirrAccounts: user.banking.telebirrAccounts
    });
  } catch (error) {
    console.error('Update Telebirr account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// DELETE TELEBIRR ACCOUNT
exports.deleteTelebirrAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    if (user.banking && user.banking.telebirrAccounts) {
      user.banking.telebirrAccounts = user.banking.telebirrAccounts.filter(acc => acc.id !== parseInt(accountId));
      await user.save();
    }

    res.status(200).json({
      message: 'Telebirr account deleted successfully',
      telebirrAccounts: user.banking?.telebirrAccounts || []
    });
  } catch (error) {
    console.error('Delete Telebirr account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// UPDATE OTHER WALLET ACCOUNT
exports.updateOtherWalletAccount = async (req, res) => {
  try {
    const { accountId, walletType, phone, registeredName, isPrimary } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    if (!user.banking) {
      user.banking = {};
    }
    if (!user.banking.otherWalletAccounts) {
      user.banking.otherWalletAccounts = [];
    }

    const accountIndex = user.banking.otherWalletAccounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex !== -1) {
      if (walletType !== undefined) user.banking.otherWalletAccounts[accountIndex].walletType = walletType;
      if (phone !== undefined) user.banking.otherWalletAccounts[accountIndex].phone = phone;
      if (registeredName !== undefined) user.banking.otherWalletAccounts[accountIndex].registeredName = registeredName;
      if (isPrimary !== undefined) user.banking.otherWalletAccounts[accountIndex].isPrimary = isPrimary;
    } else {
      const newId = user.banking.otherWalletAccounts.length > 0 
        ? Math.max(...user.banking.otherWalletAccounts.map(acc => acc.id)) + 1 
        : 1;
      user.banking.otherWalletAccounts.push({
        id: newId,
        walletType: walletType || '',
        phone: phone || '',
        registeredName: registeredName || '',
        isPrimary: isPrimary || false
      });
    }

    await user.save();

    res.status(200).json({
      message: 'Other wallet account updated successfully',
      otherWalletAccounts: user.banking.otherWalletAccounts
    });
  } catch (error) {
    console.error('Update other wallet account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// DELETE OTHER WALLET ACCOUNT
exports.deleteOtherWalletAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes('supermarket') && !user.roles.includes('vendor_staff')) {
      return res.status(403).json({ message: 'Unauthorized. Only vendors can update their profile.' });
    }

    if (user.banking && user.banking.otherWalletAccounts) {
      user.banking.otherWalletAccounts = user.banking.otherWalletAccounts.filter(acc => acc.id !== parseInt(accountId));
      await user.save();
    }

    res.status(200).json({
      message: 'Other wallet account deleted successfully',
      otherWalletAccounts: user.banking?.otherWalletAccounts || []
    });
  } catch (error) {
    console.error('Delete other wallet account error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      roles: roles && Array.isArray(roles) && roles.length > 0 ? roles : ['customer']
    });

    // Return user without password
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    const vendorId = user.vendorId || user.supermarketId;
    const supermarketId = user.supermarketId || user.vendorId;

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        roles: user.roles, 
        email: user.email, 
        name: user.name,
        vendorId: vendorId,
        supermarketId: supermarketId
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        vendorId: vendorId,
        supermarketId: supermarketId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};
