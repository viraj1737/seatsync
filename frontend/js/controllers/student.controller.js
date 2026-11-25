/* Student portal: pick a floor, date and slot, then reserve a desk. */
angular.module('seatSyncApp').controller('StudentController', ['$scope', '$window', 'ApiService',
  function ($scope, $window, ApiService) {

    $scope.currentUser = null;
    $scope.floors = [];
    $scope.selectedFloor = null;
    $scope.selectedDate = new Date();
    $scope.selectedSlot = '09:00-11:00';
    $scope.slots = [
      { code: '09:00-11:00', label: '09:00 – 11:00' },
      { code: '11:00-13:00', label: '11:00 – 13:00' },
      { code: '13:00-15:00', label: '13:00 – 15:00' },
      { code: '15:00-17:00', label: '15:00 – 17:00' },
      { code: '17:00-19:00', label: '17:00 – 19:00' }
    ];
    $scope.seats = [];
    $scope.selectedSeat = null;
    $scope.myBookings = [];
    $scope.activeTab = 'reserve';
    $scope.errorMessage = '';
    $scope.isBooking = false;

    // Load the logged-in student, the floors and their bookings
    ApiService.getMe()
      .then(function (response) {
        $scope.currentUser = response.data.data;
        $scope.loadFloors();
        $scope.loadMyBookings();
      })
      .catch(function () { $window.location.href = '/login.html'; });

    $scope.loadFloors = function () {
      ApiService.getFloors().then(function (response) {
        $scope.floors = response.data.data || [];
        if ($scope.floors.length) {
          $scope.selectedFloor = $scope.floors[0];
          $scope.loadSeats();
        }
      });
    };

    // AngularJS date inputs use a Date object; the API wants YYYY-MM-DD
    $scope.formatDate = function (date) {
      var d = new Date(date);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
             '-' + String(d.getDate()).padStart(2, '0');
    };

    // Ask the server for seats with their status for the chosen date and slot
    $scope.loadSeats = function () {
      if (!$scope.selectedFloor) return;
      $scope.selectedSeat = null;
      ApiService.getSeats($scope.selectedFloor._id, $scope.formatDate($scope.selectedDate), $scope.selectedSlot)
        .then(function (response) { $scope.seats = response.data.data || []; });
    };

    $scope.selectFloor = function (floor) {
      $scope.selectedFloor = floor;
      $scope.loadSeats();
    };

    $scope.selectSlot = function (code) {
      $scope.selectedSlot = code;
      $scope.loadSeats();
    };

    // Only free desks can be chosen
    $scope.chooseSeat = function (seat) {
      $scope.errorMessage = '';
      if (seat.status !== 'available') {
        $scope.errorMessage = 'Desk ' + seat.seatNumber + ' is not available for this slot.';
        return;
      }
      $scope.selectedSeat = seat;
    };

    $scope.confirmReservation = function () {
      if (!$scope.selectedSeat || !$scope.selectedFloor) return;
      $scope.isBooking = true;
      $scope.errorMessage = '';

      ApiService.createBooking({
        seatId: $scope.selectedSeat._id,
        floorId: $scope.selectedFloor._id,
        date: $scope.formatDate($scope.selectedDate),
        slot: $scope.selectedSlot
      })
        .then(function () {
          $scope.isBooking = false;
          $scope.selectedSeat = null;
          $scope.loadSeats();
          $scope.loadMyBookings();
          $scope.activeTab = 'my-bookings';
          if (window.showSeatSyncToast) window.showSeatSyncToast('Desk reserved', 'Your seat is confirmed.', false);
        })
        .catch(function (error) {
          $scope.isBooking = false;
          $scope.errorMessage = (error.data && error.data.message) || 'Reservation failed.';
        });
    };

    $scope.loadMyBookings = function () {
      ApiService.getMyBookings().then(function (response) {
        $scope.myBookings = response.data.data || [];
      });
    };

    $scope.cancelBooking = function (booking) {
      if (!window.confirm('Release this desk?')) return;
      ApiService.cancelBooking(booking._id).then(function () {
        $scope.loadSeats();
        $scope.loadMyBookings();
      });
    };

    // Simulates tapping the campus card at the exit gate
    $scope.punchExit = function () {
      ApiService.punchExit($scope.currentUser.studentId).then(function (response) {
        $scope.loadSeats();
        $scope.loadMyBookings();
        if (window.showSeatSyncToast) window.showSeatSyncToast('Gate opened', response.data.message, false);
      }).catch(function (error) {
        $scope.errorMessage = (error.data && error.data.message) || 'Card punch failed.';
      });
    };

    $scope.switchTab = function (tab) {
      $scope.activeTab = tab;
      if (tab === 'my-bookings') $scope.loadMyBookings();
      else $scope.loadSeats();
    };

    $scope.signOut = function () {
      ApiService.logout().finally(function () { $window.location.href = '/login.html'; });
    };
  }
]);
