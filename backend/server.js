require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const seedLibraryData = require('./utils/seedData');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    const conn = await connectDB();
    
    // Seed UPES student Viraj Kumar and library inventory
    if (conn) {
      await seedLibraryData();
    }

    // Start HTTP listener
    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`[SeatSync] Server running at http://localhost:${PORT}`);
      console.log(`[SeatSync] UPES Student: viraj.29022@stu.upes.ac.in`);
      console.log(`[SeatSync] Student Portal: http://localhost:${PORT}/student.html`);
      console.log(`[SeatSync] Admin Console:  http://localhost:${PORT}/admin.html`);
      console.log(`======================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[SeatSync Alert] Port ${PORT} is currently busy.`);
        console.error(`To free port ${PORT}, run: lsof -ti :${PORT} | xargs kill -9\n`);
      } else {
        console.error('[SeatSync Server Error]', err);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('[SeatSync] Startup exception:', error);
  }
};

startServer();
