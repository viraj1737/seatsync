const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const configureSession = require('./config/session');

// Import modular API routes
const authRoutes = require('./routes/auth.routes');
const floorRoutes = require('./routes/floor.routes');
const seatRoutes = require('./routes/seat.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware with MongoDB store
app.use(configureSession());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Mount API routes (Blueprint Section 8)
app.use('/api/auth', authRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'SeatSync Library Reservation API',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      sessionActive: !!(req.session && req.session.user),
      currentUser: req.session ? req.session.user : null
    }
  });
});

// API 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Fallback for HTML5 client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = app;
