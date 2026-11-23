const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required'],
    trim: true,
    uppercase: true
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: [true, 'Floor assignment is required']
  },
  zone: {
    type: String,
    default: 'General Study',
    trim: true
  },
  hasPowerOutlet: {
    type: Boolean,
    default: true
  },
  // Physical status maintained by library staff
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied', 'unavailable'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Composite unique index: Seat number unique within each floor
SeatSchema.index({ floorId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', SeatSchema);
