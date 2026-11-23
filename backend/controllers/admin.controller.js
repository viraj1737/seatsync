const User = require('../models/User');
const Floor = require('../models/Floor');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

/**
 * High-level library summary metrics
 * GET /api/admin/summary
 */
const getSummary = async (req, res) => {
  try {
    const totalSeats = await Seat.countDocuments({ isActive: true });
    const totalFloors = await Floor.countDocuments({ isActive: true });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });

    const occupancyRate = totalSeats > 0 ? Math.round((activeBookings / totalSeats) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalSeats,
        totalFloors,
        totalStudents,
        activeBookings,
        occupancyRate: Math.min(occupancyRate, 100)
      }
    });
  } catch (error) {
    console.error('[SeatSync Admin] Summary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate summary' });
  }
};

/**
 * Floor management
 */
const createFloor = async (req, res) => {
  try {
    const floor = new Floor(req.body);
    await floor.save();
    return res.status(201).json({ success: true, data: floor });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, data: floor });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Seat management & physical override
 */
const createSeat = async (req, res) => {
  try {
    const seat = new Seat(req.body);
    await seat.save();
    return res.status(201).json({ success: true, data: seat });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateSeat = async (req, res) => {
  try {
    const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, data: seat });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteSeat = async (req, res) => {
  try {
    const seat = await Seat.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    return res.status(200).json({ success: true, message: 'Seat disabled successfully', data: seat });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Booking inspection
 */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email studentId')
      .populate('seatId', 'seatNumber zone')
      .populate('floorId', 'name code')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
};

/**
 * D3.js Analytics Feed
 * GET /api/admin/analytics/occupancy
 */
const getOccupancyAnalytics = async (req, res) => {
  try {
    const floors = await Floor.find({ isActive: true });
    
    const chartData = await Promise.all(floors.map(async floor => {
      const total = await Seat.countDocuments({ floorId: floor._id, isActive: true });
      const reserved = await Booking.countDocuments({ floorId: floor._id, status: 'confirmed' });
      const occupiedPhysical = await Seat.countDocuments({ floorId: floor._id, status: 'occupied', isActive: true });
      
      const occupiedTotal = reserved + occupiedPhysical;
      const available = Math.max(0, total - occupiedTotal);

      return {
        floorName: floor.name,
        code: floor.code,
        totalSeats: total,
        occupiedSeats: occupiedTotal,
        availableSeats: available,
        occupancyPercentage: total > 0 ? Math.round((occupiedTotal / total) * 100) : 0
      };
    }));

    return res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('[SeatSync Admin] Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate analytics data' });
  }
};

module.exports = {
  getSummary,
  createFloor,
  updateFloor,
  createSeat,
  updateSeat,
  deleteSeat,
  getAllBookings,
  getOccupancyAnalytics
};
