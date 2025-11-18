require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PhonePe Payment SDK API is running',
    version: '1.0.0',
    endpoints: {
      initiate: 'POST /api/payment/initiate',
      callback: 'POST /api/payment/callback',
      status: 'GET /api/payment/status/:merchantTransactionId',
      all: 'GET /api/payment/all',
      get: 'GET /api/payment/:merchantTransactionId',
    },
  });
});

// Simple success page for payment redirect (when no frontend)
app.get('/payment/success', (req, res) => {
  const merchantTransactionId = req.query.merchantTransactionId || req.query.transactionId || 'N/A';
  res.json({
    success: true,
    message: 'Payment successful',
    merchantTransactionId: merchantTransactionId,
    note: 'Payment has been processed successfully. Check status using GET /api/payment/status/' + merchantTransactionId
  });
});

app.use('/api/payment', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server only if not in test environment
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    try {
      // Connect to MongoDB first
      await connectDB();
      
      // Start server after MongoDB connection
      const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
      });

      // Handle server errors
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Please use a different port.`);
          process.exit(1);
        } else {
          console.error('Server error:', err);
          process.exit(1);
        }
      });
    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  }
};

// Start the server
startServer();

// Export app for testing
module.exports = app;

