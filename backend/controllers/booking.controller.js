const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Floor = require('../models/Floor');
const User = require('../models/User');
const { parseSlotTimestamps, checkSeatConflict, checkUserConflict } = require('../utils/bookingRules');

/**
 * Reserve a seat
 * POST /api/bookings
 */
const createBooking = async (req, res) => {
  try {
    const { seatId, floorId, date, slot } = req.body;
    const userId = req.user.id;

    if (!seatId || !floorId || !date || !slot) {
      return res.status(400).json({
        success: false,
        message: 'All booking fields (seat, floor, date, time slot) are required.'
      });
    }

    const slotInfo = parseSlotTimestamps(date, slot);
    if (!slotInfo) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date or time slot format.'
      });
    }

    // 1. Verify seat exists and is physically operational
    const seat = await Seat.findById(seatId);
    if (!seat || !seat.isActive) {
      return res.status(404).json({
        success: false,
        message: 'The requested seat does not exist or has been disabled.'
      });
    }

    if (seat.status === 'unavailable' || seat.status === 'occupied') {
      return res.status(400).json({
        success: false,
        message: `This seat is currently ${seat.status} by library administration.`
      });
    }

    // 2. Prevent user double booking in the same slot
    const userConflict = await checkUserConflict(userId, slotInfo.startAt, slotInfo.endAt);
    if (userConflict) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active seat reservation during this time slot.'
      });
    }

    // 3. Strict conflict check: Backend double check right before writing
    const seatConflict = await checkSeatConflict(seatId, slotInfo.startAt, slotInfo.endAt);
    if (seatConflict) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: This seat was just reserved by another student for the selected slot.'
      });
    }

    // 4. Create confirmed booking
    const booking = new Booking({
      userId,
      seatId,
      floorId,
      bookingDate: date,
      slotCode: slot,
      startAt: slotInfo.startAt,
      endAt: slotInfo.endAt,
      status: 'confirmed'
    });

    await booking.save();
    await booking.populate(['seatId', 'floorId']);

    return res.status(201).json({
      success: true,
      message: `Seat ${seat.seatNumber} successfully reserved for ${slotInfo.slot.label}!`,
      data: booking
    });
  } catch (error) {
    console.error('[SeatSync] Booking creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete reservation. Please try again.'
    });
  }
};

/**
 * Get current logged in student's bookings
 * GET /api/bookings/mine
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('seatId')
      .populate('floorId')
      .sort({ startAt: -1 });

    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('[SeatSync] Error fetching user bookings:', error);
    return res.status(500).json({ success: false, message: 'Could not load your bookings' });
  }
};

/**
 * Cancel / Release seat reservation
 * PATCH /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('seatId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    // Ensure only the owner or an admin can cancel
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This reservation is already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Reservation for seat ${booking.seatId ? booking.seatId.seatNumber : ''} has been cancelled. Seat is now released!`,
      data: booking
    });
  } catch (error) {
    console.error('[SeatSync] Cancellation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};

/**
 * RFID Smart Card Punch Exit Gate Endpoint
 * POST /api/bookings/punch-exit
 * Simulates physical turnstile RFID punch: tapping student card automatically releases the allotted seat!
 */
const punchExit = async (req, res) => {
  try {
    const studentId = req.body.studentId || (req.user ? req.user.studentId : null);
    const barcode = req.body.barcode;

    let user = null;
    if (studentId) {
      user = await User.findOne({ studentId });
    } else if (req.user) {
      user = await User.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'RFID Card not recognized by exit turnstile scanner.'
      });
    }

    // Find student's active confirmed booking
    const booking = await Booking.findOne({
      userId: user._id,
      status: 'confirmed'
    }).populate('seatId floorId');

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: `Card scanned for ${user.name} (SAP: ${user.studentId}), but no active seat reservation was found.`
      });
    }

    // Automatically release seat and record exit timestamp
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Card Punched! Turnstile gate opened. Desk ${booking.seatId ? booking.seatId.seatNumber : ''} has been automatically released.`,
      data: {
        bookingId: booking._id,
        seatNumber: booking.seatId ? booking.seatId.seatNumber : 'Desk',
        floor: booking.floorId ? booking.floorId.name : 'Floor 1',
        studentName: user.name,
        studentId: user.studentId,
        turnstileGate: 'Exit Turnstile Gate 02 (South Wing)',
        punchTime: new Date().toLocaleTimeString()
      }
    });
  } catch (error) {
    console.error('[SeatSync Turnstile] RFID Punch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Turnstile processing error. Please retry card punch.'
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  punchExit
};
