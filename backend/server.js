require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const seedLibraryData = require('./utils/seedData');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Connect to MongoDB
  const conn = await connectDB();
  
  // Seed demo UPES student and library inventory
  if (conn) {
    await seedLibraryData();
  }

  // Start HTTP listener
  app.listen(PORT, () => {
    console.log(`[SeatSync] Server running at http://localhost:${PORT}`);
  });
};

startServer();
