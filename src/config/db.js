const mongoose = require('mongoose');
const dns = require('dns');

// Fallback to Google/Cloudflare DNS for local Windows DNS SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // ignore if restricted
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;