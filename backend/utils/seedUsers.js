const User = require('../models/User');

/**
 * Seed initial admin and student accounts if none exist
 */
const seedUsers = async () => {
  try {
    const adminEmail = 'admin@seatsync.edu';
    const studentEmail = 'student@seatsync.edu';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminPassHash = await User.hashPassword('Admin1234');
      await User.create({
        name: 'Library Administrator',
        email: adminEmail,
        passwordHash: adminPassHash,
        studentId: null,
        role: 'admin'
      });
      console.log('[SeatSync Seed] Default Admin created: admin@seatsync.edu / Admin1234');
    }

    const existingStudent = await User.findOne({ email: studentEmail });
    if (!existingStudent) {
      const studentPassHash = await User.hashPassword('Student1234');
      await User.create({
        name: 'Alex Rivera',
        email: studentEmail,
        passwordHash: studentPassHash,
        studentId: 'STU-2026-089',
        role: 'student'
      });
      console.log('[SeatSync Seed] Default Student created: student@seatsync.edu / Student1234');
    }
  } catch (error) {
    console.error('[SeatSync Seed] Error seeding demo accounts:', error.message);
  }
};

module.exports = seedUsers;
