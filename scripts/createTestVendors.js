const mongoose = require('mongoose');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
require('dotenv').config();

async function createTestVendors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bicycle-app');
    console.log('Connected to MongoDB');

    // Create vendor users - Add your test vendors here
    const vendorUsers = [];

    const bcrypt = require('bcryptjs');

    for (const vendorData of vendorUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: vendorData.email });
      if (existingUser) {
        console.log(`User ${vendorData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(vendorData.password, salt);

      // Create user
      const user = await User.create({
        name: vendorData.name,
        email: vendorData.email,
        password: hashedPassword,
        roles: vendorData.roles,
        branding: vendorData.branding,
        operations: vendorData.operations
      });

      // Create vendor record
      const vendor = await Vendor.create({
        name: vendorData.branding.storeName,
        description: vendorData.branding.businessBio,
        address: {
          street: vendorData.operations.streetAddress,
          city: vendorData.operations.city,
          state: vendorData.operations.region,
          zipCode: vendorData.operations.postalCode
        },
        location: {
          type: 'Point',
          coordinates: [38.7578, 8.9638] // Addis Ababa coordinates
        },
        deliveryZone: {
          type: 'Polygon',
          coordinates: [[
            [38.7, 8.9],
            [38.8, 8.9],
            [38.8, 9.0],
            [38.7, 9.0],
            [38.7, 8.9]
          ]]
        },
        ownerId: user._id,
        isApproved: true,
        isOpen: true
      });

      // Link vendor to user
      user.supermarketId = vendor._id;
      user.vendorId = vendor._id;
      await user.save();

      console.log(`Created vendor: ${vendorData.branding.storeName} (${vendorData.email})`);
    }

    console.log('\nTest vendors created successfully!');
    console.log('\nLogin credentials (password: password123):');
    vendorUsers.forEach(v => {
      console.log(`- ${v.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test vendors:', error);
    process.exit(1);
  }
}

createTestVendors();
