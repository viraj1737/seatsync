/**
 * SeatSync Student Portal Controller
 * Drives real-time seat browsing, slot selection, seat allotment, and RFID turnstile exit
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
  $scope.isPunching = false;
  $scope.turnstileStatus = null; // feedback after punch
  $scope.statusMessage = null; // { type: 'success'|'danger'|'info', text: '...' }
  $scope.activeTab = 'reserve'; // 'reserve' | 'my-bookings'

  // Dedicated tab switcher function to cleanly update parent scope across child scopes (ng-if/ng-repeat)
  $scope.switchTab = function (tabName) {
    $scope.activeTab = tabName;
    if (tabName === 'reserve') {
      $scope.loadSeats();
    } else if (tabName === 'my-bookings') {
      $scope.loadMyBookings();
    }
  };

  // Initialize student session & data
  $scope.init = function () {
    ApiService.getMe()
      .then(function (response) {
        $scope.currentUser = response.data.data;
        $scope.loadFloors();
        $scope.loadMyBookings();
      })
      .catch(function () {
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
      .catch(function () {
        $scope.isLoadingSeats = false;
        $scope.showMessage('danger', 'Failed to retrieve library seating map.');
      });
  };

  // Select a seat on the grid
  $scope.chooseSeat = function (seat) {
    if (seat.status !== 'available') {
      if (seat.status === 'reserved') {
        $scope.showMessage('danger', `Desk ${seat.seatNumber} is already reserved for this slot.`);
      } else if (seat.status === 'occupied') {
        $scope.showMessage('danger', `Desk ${seat.seatNumber} is physically occupied by library staff.`);
      } else {
        $scope.showMessage('danger', `Desk ${seat.seatNumber} is temporarily out of service.`);
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
      $scope.activeBooking = $scope.myBookings.find(b => b.status === 'confirmed') || null;
    });
  };

  // RFID Turnstile Card Punch Exit (Simulates touching UPES ID Card to Turnstile Scanner)
  $scope.punchCardExit = function () {
    $scope.isPunching = true;
    $scope.turnstileStatus = 'Scanning Smart Card...';

    setTimeout(function () {
      const studentId = ($scope.currentUser && $scope.currentUser.studentId) || '590029022';
      
      ApiService.punchExit(studentId)
        .then(function (response) {
          $scope.isPunching = false;
          $scope.turnstileStatus = 'Card Punched! Gate Unlocked & Desk Released.';
          $scope.showMessage('success', response.data.message);
          
          if (typeof window.showSeatSyncToast === 'function') {
            window.showSeatSyncToast('RFID Card Punched', 'Turnstile Gate 02 Opened • Seat Released!');
          }

          $scope.loadSeats();
          $scope.loadMyBookings();

          setTimeout(function () {
            $scope.$apply(function () {
              $scope.turnstileStatus = null;
            });
          }, 5000);
        })
        .catch(function (error) {
          $scope.isPunching = false;
          $scope.turnstileStatus = null;
          const msg = (error.data && error.data.message) ? error.data.message : 'Turnstile card punch failed.';
          $scope.showMessage('danger', msg);
        });
    }, 700); // realistic sensor scan feedback
  };

  // Fallback manual cancel if needed
  $scope.manualCancel = function (booking) {
    if (!confirm('Release this seat?')) return;
    ApiService.cancelBooking(booking._id).then(function () {
      $scope.showMessage('success', 'Seat released successfully.');
      $scope.loadSeats();
      $scope.loadMyBookings();
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
