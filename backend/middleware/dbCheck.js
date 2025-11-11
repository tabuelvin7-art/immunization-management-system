const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Middleware to ensure database connection
const ensureDbConnection = async (req, res, next) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, attempting to connect...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    res.status(503).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
};

module.exports = ensureDbConnection;
