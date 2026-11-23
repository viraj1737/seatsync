const User = require('../models/User');
const Floor = require('../models/Floor');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

const seedLibraryData = async () => {
  try {
    // 1. Seed UPES Student: viraj.29022@stu.upes.ac.in
    const studentEmail = 'viraj.29022@stu.upes.ac.in';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      const studentHash = await User.hashPassword('Password123');
      student = await User.create({
        name: 'Viraj Kumar',
        email: studentEmail,
        passwordHash: studentHash,
        studentId: '590029022',
        role: 'student'
      });
      console.log(`[SeatSync Seed] UPES Student account created: ${studentEmail} (Password: Password123)`);
    }

    // 2. Seed Library Admin
    const adminEmail = 'admin@seatsync.edu';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const adminHash = await User.hashPassword('Admin1234');
      admin = await User.create({
        name: 'UPES Library Administrator',
        email: adminEmail,
        passwordHash: adminHash,
        studentId: 'LIB-ADMIN-01',
        role: 'admin'
      });
      console.log(`[SeatSync Seed] Admin account created: ${adminEmail} (Password: Admin1234)`);
    }

    // 3. Seed Library Floors
    const existingFloorsCount = await Floor.countDocuments();
    if (existingFloorsCount === 0) {
      const floor1 = await Floor.create({
        name: 'Floor 1 — Tech & Engineering Wing',
        code: 'FL-1',
        level: 1,
        zones: ['Quiet Research', 'Coding Pods', 'Reference Desk'],
        capacity: 16
      });

      const floor2 = await Floor.create({
        name: 'Floor 2 — Quiet Study & Periodicals',
        code: 'FL-2',
        level: 2,
        zones: ['Silent Cubicles', 'Discussion Pods'],
        capacity: 16
      });

      console.log('[SeatSync Seed] Library Floors created.');

      // 4. Seed Seats for Floor 1
      const seatsFloor1 = [];
      for (let i = 1; i <= 16; i++) {
        const seatNum = `A-${i < 10 ? '0' + i : i}`;
        const zone = i <= 6 ? 'Quiet Research' : (i <= 12 ? 'Coding Pods' : 'Reference Desk');
        const physicalStatus = (i === 4) ? 'occupied' : (i === 8 ? 'unavailable' : 'available');
        seatsFloor1.push({
          seatNumber: seatNum,
          floorId: floor1._id,
          zone,
          hasPowerOutlet: i % 2 !== 0,
          status: physicalStatus,
          notes: i === 8 ? 'Power outlet under maintenance' : 'Standard desk'
        });
      }
      await Seat.insertMany(seatsFloor1);

      // Seed Seats for Floor 2
      const seatsFloor2 = [];
      for (let i = 1; i <= 16; i++) {
        const seatNum = `B-${i < 10 ? '0' + i : i}`;
        const zone = i <= 8 ? 'Silent Cubicles' : 'Discussion Pods';
        const physicalStatus = (i === 3) ? 'occupied' : 'available';
        seatsFloor2.push({
          seatNumber: seatNum,
          floorId: floor2._id,
          zone,
          hasPowerOutlet: true,
          status: physicalStatus,
          notes: 'High ergonomic seating'
        });
      }
      await Seat.insertMany(seatsFloor2);

      console.log('[SeatSync Seed] 32 Library Desks initialized with power sockets and zone mapping.');

      // 5. Seed one active sample booking for another seat to test reserved status
      const seatA3 = await Seat.findOne({ floorId: floor1._id, seatNumber: 'A-03' });
      if (seatA3) {
        const todayStr = new Date().toISOString().slice(0, 10);
        await Booking.create({
          userId: admin._id,
          seatId: seatA3._id,
          floorId: floor1._id,
          bookingDate: todayStr,
          slotCode: '09:00-11:00',
          startAt: new Date(new Date().setHours(9, 0, 0, 0)),
          endAt: new Date(new Date().setHours(11, 0, 0, 0)),
          status: 'confirmed'
        });
        console.log('[SeatSync Seed] Sample reserved seat A-03 seeded.');
      }
    }
  } catch (error) {
    console.error('[SeatSync Seed] Error seeding library data:', error);
  }
};

module.exports = seedLibraryData;
