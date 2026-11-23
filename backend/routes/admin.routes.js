const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const requireAdmin = require('../middleware/requireAdmin');

// All admin endpoints require admin role
router.use(requireAdmin);

router.get('/summary', adminController.getSummary);
router.post('/floors', adminController.createFloor);
router.patch('/floors/:id', adminController.updateFloor);
router.post('/seats', adminController.createSeat);
router.patch('/seats/:id', adminController.updateSeat);
router.delete('/seats/:id', adminController.deleteSeat);
router.get('/bookings', adminController.getAllBookings);
router.get('/analytics/occupancy', adminController.getOccupancyAnalytics);

module.exports = router;
