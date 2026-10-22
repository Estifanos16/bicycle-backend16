const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bicycle-app');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bicycle.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@bicycle.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@bicycle.com',
      password: hashedPassword,
      roles: ['admin'],
      isVerified: true
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@bicycle.com');
    console.log('Password: admin123');
    console.log('Roles: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
