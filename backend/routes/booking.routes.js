const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const requireAuth = require('../middleware/requireAuth');

router.post('/', requireAuth, bookingController.createBooking);
router.get('/mine', requireAuth, bookingController.getMyBookings);
router.patch('/:id/cancel', requireAuth, bookingController.cancelBooking);

module.exports = router;
