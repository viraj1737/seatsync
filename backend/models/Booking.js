const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  seatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: [true, 'Seat ID is required']
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: [true, 'Floor ID is required']
  },
  bookingDate: {
    type: String, // Stored as YYYY-MM-DD
    required: [true, 'Booking date is required']
  },
  slotCode: {
    type: String, // e.g., '09:00-11:00'
    required: [true, 'Time slot code is required']
  },
  startAt: {
    type: Date,
    required: [true, 'Start timestamp is required']
  },
  endAt: {
    type: Date,
    required: [true, 'End timestamp is required']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date,
    default: null
  }
});

// Recommended composite indexes for rapid conflict checks & user queries
BookingSchema.index({ seatId: 1, startAt: 1, endAt: 1, status: 1 });
BookingSchema.index({ userId: 1, startAt: 1, status: 1 });
BookingSchema.index({ bookingDate: 1, slotCode: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
