/**
 * SeatSync Student Portal Controller
 * Drives real-time seat browsing, slot selection, seat allotment, and exit release
 */
angular.module('seatSyncApp').controller('StudentController', ['$scope', '$window', 'ApiService', function ($scope, $window, ApiService) {
  $scope.currentUser = null;
  $scope.floors = [];
  $scope.selectedFloor = null;
  $scope.selectedDate = new Date().toISOString().slice(0, 10);
  $scope.slots = [
    { code: '09:00-11:00', label: '09:00 AM – 11:00 AM', timeLabel: 'Morning Slot' },
    { code: '11:00-13:00', label: '11:00 AM – 01:00 PM', timeLabel: 'Midday Slot' },
    { code: '13:00-15:00', label: '01:00 PM – 03:00 PM', timeLabel: 'Afternoon Slot' },
    { code: '15:00-17:00', label: '03:00 PM – 05:00 PM', timeLabel: 'Evening Slot' },
    { code: '17:00-19:00', label: '05:00 PM – 07:00 PM', timeLabel: 'Night Slot' }
  ];
  $scope.selectedSlot = '09:00-11:00';

  $scope.seats = [];
  $scope.selectedSeat = null;
  $scope.myBookings = [];
  $scope.activeBooking = null;

  $scope.isLoadingSeats = false;
  $scope.isBooking = false;
  $scope.statusMessage = null; // { type: 'success'|'danger'|'info', text: '...' }
  $scope.activeTab = 'reserve'; // 'reserve' | 'my-bookings'

  // Initialize student session & data
  $scope.init = function () {
    ApiService.getMe()
      .then(function (response) {
        $scope.currentUser = response.data.data;
        $scope.loadFloors();
        $scope.loadMyBookings();
      })
      .catch(function () {
        // Not authenticated
        $window.location.href = '/login.html';
      });
  };

  // Load available library floors
  $scope.loadFloors = function () {
    ApiService.getFloors().then(function (response) {
      $scope.floors = response.data.data || [];
      if ($scope.floors.length > 0) {
        $scope.selectedFloor = $scope.floors[0];
        $scope.loadSeats();
      }
    });
  };

  // Switch floor
  $scope.selectFloor = function (floor) {
    $scope.selectedFloor = floor;
    $scope.selectedSeat = null;
    $scope.loadSeats();
  };

  // Switch slot
  $scope.selectSlot = function (slotCode) {
    $scope.selectedSlot = slotCode;
    $scope.selectedSeat = null;
    $scope.loadSeats();
  };

  // Load seats with computed live statuses
  $scope.loadSeats = function () {
    if (!$scope.selectedFloor) return;

    $scope.isLoadingSeats = true;
    ApiService.getSeats($scope.selectedFloor._id, $scope.selectedDate, $scope.selectedSlot)
      .then(function (response) {
        $scope.seats = response.data.data || [];
        $scope.isLoadingSeats = false;
      })
      .catch(function (error) {
        $scope.isLoadingSeats = false;
        $scope.showMessage('danger', 'Failed to retrieve library seating map.');
      });
  };

  // Select a seat on the grid
  $scope.chooseSeat = function (seat) {
    if (seat.status !== 'available') {
      if (seat.status === 'reserved') {
        $scope.showMessage('danger', `Seat ${seat.seatNumber} is already reserved for this slot.`);
      } else if (seat.status === 'occupied') {
        $scope.showMessage('danger', `Seat ${seat.seatNumber} is physically occupied by library staff.`);
      } else {
        $scope.showMessage('danger', `Seat ${seat.seatNumber} is temporarily out of service.`);
      }
      return;
    }

    $scope.selectedSeat = seat;
  };

  // Confirm reservation / Seat Allotment
  $scope.confirmReservation = function () {
    if (!$scope.selectedSeat || !$scope.selectedFloor) return;

    $scope.isBooking = true;
    const payload = {
      seatId: $scope.selectedSeat._id,
      floorId: $scope.selectedFloor._id,
      date: $scope.selectedDate,
      slot: $scope.selectedSlot
    };

    ApiService.createBooking(payload)
      .then(function (response) {
        $scope.isBooking = false;
        $scope.selectedSeat = null;
        $scope.showMessage('success', response.data.message || 'Seat reserved successfully!');
        
        // Trigger jQuery toast notification if available
        if (typeof window.showSeatSyncToast === 'function') {
          window.showSeatSyncToast('Seat Allotted Successfully!', response.data.message);
        }

        $scope.loadSeats();
        $scope.loadMyBookings();
        $scope.activeTab = 'my-bookings'; // Switch to show active pass!
      })
      .catch(function (error) {
        $scope.isBooking = false;
        const msg = (error.data && error.data.message) ? error.data.message : 'Reservation failed.';
        $scope.showMessage('danger', msg);
      });
  };

  // Load student's bookings
  $scope.loadMyBookings = function () {
    ApiService.getMyBookings().then(function (response) {
      $scope.myBookings = response.data.data || [];
      // Identify active reservation
      $scope.activeBooking = $scope.myBookings.find(b => b.status === 'confirmed') || null;
    });
  };

  // Exit / Cancel Reservation
  $scope.exitAndReleaseSeat = function (booking) {
    if (!confirm('Are you sure you want to release your reserved seat? This will allow other students to use it.')) {
      return;
    }

    ApiService.cancelBooking(booking._id)
      .then(function (response) {
        $scope.showMessage('success', response.data.message || 'Seat released successfully.');
        if (typeof window.showSeatSyncToast === 'function') {
          window.showSeatSyncToast('Seat Released', 'Your desk has been made available for other students.');
        }
        $scope.loadSeats();
        $scope.loadMyBookings();
      })
      .catch(function (error) {
        const msg = (error.data && error.data.message) ? error.data.message : 'Failed to release seat.';
        $scope.showMessage('danger', msg);
      });
  };

  $scope.showMessage = function (type, text) {
    $scope.statusMessage = { type: type, text: text };
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.statusMessage = null;
      });
    }, 4500);
  };

  $scope.signOut = function () {
    ApiService.logout().finally(function () {
      $window.location.href = '/login.html';
    });
  };

  $scope.init();
}]);
