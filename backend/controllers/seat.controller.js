const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const { parseSlotTimestamps } = require('../utils/bookingRules');

const getSeats = async (req, res) => {
  try {
    const { floorId, date, slot } = req.query;

    if (!floorId) {
      return res.status(400).json({ success: false, message: 'Floor ID is required' });
    }

    const seats = await Seat.find({ floorId, isActive: true }).sort({ seatNumber: 1 });

    // If date and slot are provided, compute dynamic availability based on confirmed bookings
    let slotTimes = null;
    let confirmedSeatIds = new Set();

    if (date && slot) {
      slotTimes = parseSlotTimestamps(date, slot);
      if (slotTimes) {
        const bookings = await Booking.find({
          floorId,
          status: 'confirmed',
          startAt: { $lt: slotTimes.endAt },
          endAt: { $gt: slotTimes.startAt }
        }).select('seatId userId');

        bookings.forEach(b => confirmedSeatIds.add(b.seatId.toString()));
      }
    }

    const computedSeats = seats.map(seat => {
      let computedStatus = seat.status; // Default to physical status in DB

      // If staff haven't physically blocked it, check reservation state
      if (seat.status === 'available') {
        if (confirmedSeatIds.has(seat._id.toString())) {
          computedStatus = 'reserved';
        }
      }

      return {
        _id: seat._id,
        seatNumber: seat.seatNumber,
        floorId: seat.floorId,
        zone: seat.zone,
        hasPowerOutlet: seat.hasPowerOutlet,
        physicalStatus: seat.status,
        status: computedStatus,
        notes: seat.notes
      };
    });

    return res.status(200).json({
      success: true,
      data: computedSeats
    });
  } catch (error) {
    console.error('[SeatSync] Error fetching seats:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve seats' });
  }
};

module.exports = {
  getSeats
};
