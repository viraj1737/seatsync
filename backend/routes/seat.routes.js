const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seat.controller');
const requireAuth = require('../middleware/requireAuth');

router.get('/', requireAuth, seatController.getSeats);

module.exports = router;
