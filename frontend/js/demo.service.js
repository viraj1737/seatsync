/* Vercel hosts only the frontend, so there is no /api server there.
   This small service keeps demo data in the browser instead. Locally the real
   API is used, because it answers before we ever reach this fallback. */
angular.module('seatSyncApp').service('DemoService', ['$q', function ($q) {
  var KEY = 'seatsync-demo';

  var floors = [
    { _id: 'FL-1', name: 'Floor 1 — Tech & Engineering Wing', code: 'FL-1', level: 1 },
    { _id: 'FL-2', name: 'Floor 2 — Quiet Study & Periodicals', code: 'FL-2', level: 2 }
  ];

  function makeSeats() {
    var seats = [];
    floors.forEach(function (floor) {
      for (var i = 1; i <= 16; i++) {
        var number = (floor.code === 'FL-1' ? 'A-' : 'B-') + String(i).padStart(2, '0');
        seats.push({
          _id: floor.code + '-' + number,
          seatNumber: number,
          floorId: floor._id,
          zone: i <= 6 ? 'Quiet Research' : (i <= 12 ? 'Coding Pods' : 'Reference Desk'),
          hasPowerOutlet: i % 2 === 1,
          physicalStatus: 'available'
        });
      }
    });
    return seats;
  }

  // All demo state is saved in localStorage
  function read() {
    var raw = localStorage.getItem(KEY);
    if (!raw) {
      raw = JSON.stringify({ user: null, bookings: [], seatStatus: {} });
      localStorage.setItem(KEY, raw);
    }
    return JSON.parse(raw);
  }

  function write(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function reply(data, message) {
    return $q.when({ data: { success: true, data: data, message: message || '' } });
  }

  function seats() {
    var state = read();
    return makeSeats().map(function (seat) {
      var physical = state.seatStatus[seat._id] || 'available';
      var reserved = state.bookings.some(function (b) {
        return b.status === 'confirmed' && b.seatId._id === seat._id;
      });
      seat.status = physical !== 'available' ? physical : (reserved ? 'reserved' : 'available');
      return seat;
    });
  }

  function findSeat(id) {
    return seats().filter(function (s) { return s._id === id; })[0];
  }

  function findFloor(id) {
    return floors.filter(function (f) { return f._id === id; })[0];
  }

  this.getMe = function () { return reply(read().user); };

  this.login = function (credentials) {
    var state = read();
    state.user = {
      name: credentials.email.indexOf('admin') === 0 ? 'Library Administrator' : 'Demo Student',
      email: credentials.email,
      studentId: '590029022',
      role: credentials.email.indexOf('admin') === 0 ? 'admin' : 'student'
    };
    write(state);
    return reply(state.user, 'Signed in (demo mode).');
  };

  this.register = function (data) {
    var state = read();
    state.user = {
      name: data.name, email: data.email, studentId: data.studentId, role: 'student'
    };
    write(state);
    return reply(state.user, 'Account created (demo mode).');
  };

  this.logout = function () {
    var state = read();
    state.user = null;
    write(state);
    return reply(null, 'Signed out.');
  };

  this.getFloors = function () { return reply(floors); };

  this.getSeats = function (floorId) {
    return reply(seats().filter(function (seat) { return seat.floorId === floorId; }));
  };

  this.createBooking = function (data) {
    var state = read();
    var seat = findSeat(data.seatId);
    var booking = {
      _id: 'demo-' + Date.now(),
      userId: { name: state.user ? state.user.name : 'Demo Student' },
      seatId: { seatNumber: seat.seatNumber, zone: seat.zone },
      floorId: { name: findFloor(data.floorId).name },
      bookingDate: data.date,
      slotCode: data.slot,
      status: 'confirmed'
    };
    state.bookings.unshift(booking);
    write(state);
    return reply(booking, 'Seat ' + seat.seatNumber + ' reserved (demo mode).');
  };

  this.getMyBookings = function () { return reply(read().bookings); };

  this.cancelBooking = function (id) {
    var state = read();
    state.bookings.forEach(function (b) {
      if (b._id === id) b.status = 'cancelled';
    });
    write(state);
    return reply(null, 'Seat released.');
  };

  this.punchExit = function () {
    var state = read();
    state.bookings.forEach(function (b) {
      if (b.status === 'confirmed') b.status = 'cancelled';
    });
    write(state);
    return reply(null, 'Gate opened. Your desk has been released.');
  };

  this.getAdminSummary = function () {
    var state = read();
    var all = seats();
    return reply({
      totalSeats: all.length,
      totalFloors: floors.length,
      totalStudents: 4,
      activeBookings: state.bookings.filter(function (b) { return b.status === 'confirmed'; }).length,
      occupancyRate: Math.round((state.bookings.filter(function (b) { return b.status === 'confirmed'; }).length / all.length) * 100)
    });
  };

  this.getAllBookings = function () { return reply(read().bookings); };

  this.updateSeatStatus = function (seatId, status) {
    var state = read();
    state.seatStatus[seatId] = status;
    write(state);
    return reply(null, 'Status updated.');
  };

  this.getOccupancyAnalytics = function () {
    var all = seats();
    return reply(floors.map(function (floor) {
      var list = all.filter(function (s) { return s.floorId === floor._id; });
      var used = list.filter(function (s) { return s.status !== 'available'; }).length;
      return {
        code: floor.code,
        floorName: floor.name,
        totalSeats: list.length,
        occupiedSeats: used,
        availableSeats: list.length - used
      };
    }));
  };
}]);
