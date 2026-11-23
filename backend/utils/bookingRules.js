const Booking = require('../models/Booking');

const FIXED_SLOTS = [
  { code: '09:00-11:00', label: '09:00 AM – 11:00 AM', startHour: 9, startMin: 0, endHour: 11, endMin: 0 },
  { code: '11:00-13:00', label: '11:00 AM – 01:00 PM', startHour: 11, startMin: 0, endHour: 13, endMin: 0 },
  { code: '13:00-15:00', label: '01:00 PM – 03:00 PM', startHour: 13, startMin: 0, endHour: 15, endMin: 0 },
  { code: '15:00-17:00', label: '03:00 PM – 05:00 PM', startHour: 15, startMin: 0, endHour: 17, endMin: 0 },
  { code: '17:00-19:00', label: '05:00 PM – 07:00 PM', startHour: 17, startMin: 0, endHour: 19, endMin: 0 }
];

/**
 * Parses date string (YYYY-MM-DD) and slotCode into startAt and endAt Date objects
 */
const parseSlotTimestamps = (dateStr, slotCode) => {
  const slot = FIXED_SLOTS.find(s => s.code === slotCode);
  if (!slot) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  
  const startAt = new Date(year, month - 1, day, slot.startHour, slot.startMin, 0, 0);
  const endAt = new Date(year, month - 1, day, slot.endHour, slot.endMin, 0, 0);

  return { startAt, endAt, slot };
};

/**
 * Strict conflict check rule:
 * existing.startAt < requested.endAt AND existing.endAt > requested.startAt
 */
const checkSeatConflict = async (seatId, startAt, endAt) => {
  const conflict = await Booking.findOne({
    seatId: seatId,
    status: 'confirmed',
    startAt: { $lt: endAt },
    endAt: { $gt: startAt }
  });

  return conflict;
};

/**
 * Checks if user already has an active overlapping reservation
 */
const checkUserConflict = async (userId, startAt, endAt) => {
  const conflict = await Booking.findOne({
    userId: userId,
    status: 'confirmed',
    startAt: { $lt: endAt },
    endAt: { $gt: startAt }
  });

  return conflict;
};

module.exports = {
  FIXED_SLOTS,
  parseSlotTimestamps,
  checkSeatConflict,
  checkUserConflict
};
