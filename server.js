const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');

// Load env variables
dotenv.config();

// Connect database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "https://bicycle-frontend-rrsi.vercel.app",
  credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
// testing fourth push