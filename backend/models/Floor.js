const mongoose = require('mongoose');

const FloorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Floor name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Floor code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  level: {
    type: Number,
    required: true,
    default: 1
  },
  zones: {
    type: [String],
    default: ['General Study']
  },
  capacity: {
    type: Number,
    default: 24
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Floor', FloorSchema);
