const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const requireAuth = require('../middleware/requireAuth');

// Student reservation endpoints
router.post('/', requireAuth, bookingController.createBooking);
router.get('/mine', requireAuth, bookingController.getMyBookings);
router.patch('/:id/cancel', requireAuth, bookingController.cancelBooking);

// RFID Turnstile Card Punch Exit Endpoint (Public IoT / Hardware webhook compatible)
router.post('/punch-exit', bookingController.punchExit);

module.exports = router;
