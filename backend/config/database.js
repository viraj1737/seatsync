const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/seatsync';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[SeatSync] MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[SeatSync] MongoDB connection error: ${error.message}`);
    // Don't kill process immediately during tests/dev if mongo is temporarily down, but log clearly
    return null;
  }
};

module.exports = connectDB;
