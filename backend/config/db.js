const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    // Set mongoose options for serverless
    mongoose.set('strictQuery', false);
    
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit in serverless - just throw error
    throw new Error('Database connection failed');
  }
};

module.exports = connectDB;
