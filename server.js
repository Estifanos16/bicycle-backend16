const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const productRoutes = require('./src/routes/productRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const cartRoutes = require('./src/routes/cartRoutes');

// Load env variables
dotenv.config();

// Connect database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  // Clean the env variable if it exists, removing any accidental trailing slash
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : 'https://bicycle-frontend-rrsi.vercel.app',
  'https://bicycle-frontend.vercel.app',
  'http://localhost:5173',  // For local Vite development
  'http://localhost:3000'   // For local React development
];

const corsOptions = {
  origin: (origin, callback) => {
    // Strip trailing slash from incoming request origin for an exact match
    const sanitizedOrigin = origin ? origin.replace(/\/$/, "") : null;

    if (!sanitizedOrigin || allowedOrigins.includes(sanitizedOrigin)) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`); // This will log the exact blocked URL in Render logs
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/cart', cartRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Server error handler caught:', err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);