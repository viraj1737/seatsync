const Floor = require('../models/Floor');
const Seat = require('../models/Seat');

const getFloors = async (req, res) => {
  try {
    const floors = await Floor.find({ isActive: true }).sort({ level: 1 });
    
    // Attach seat counts
    const floorsWithStats = await Promise.all(floors.map(async floor => {
      const seatCount = await Seat.countDocuments({ floorId: floor._id, isActive: true });
      return {
        ...floor.toObject(),
        seatCount
      };
    }));

    return res.status(200).json({
      success: true,
      data: floorsWithStats
    });
  } catch (error) {
    console.error('[SeatSync] Error fetching floors:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve floors' });
  }
};

module.exports = {
  getFloors
};
