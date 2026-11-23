/**
 * SeatSync Admin Portal Controller
 * Real-time floor/seat maintenance, physical overrides, and occupancy analytics
 */
angular.module('seatSyncApp').controller('AdminController', ['$scope', '$window', 'ApiService', function ($scope, $window, ApiService) {
  $scope.currentUser = null;
  $scope.summary = {};
  $scope.floors = [];
  $scope.selectedFloor = null;
  $scope.seats = [];
  $scope.allBookings = [];
  $scope.isLoading = false;
  $scope.activeTab = 'overview'; // 'overview' | 'seats' | 'bookings' | 'analytics'

  $scope.init = function () {
    ApiService.getMe()
      .then(function (response) {
        $scope.currentUser = response.data.data;
        if ($scope.currentUser.role !== 'admin') {
          $window.location.href = '/student.html';
          return;
        }
        $scope.loadSummary();
        $scope.loadFloors();
        $scope.loadAllBookings();
      })
      .catch(function () {
        $window.location.href = '/login.html';
      });
  };

  $scope.loadSummary = function () {
    ApiService.getAdminSummary().then(function (response) {
      $scope.summary = response.data.data || {};
    });
  };

  $scope.loadFloors = function () {
    ApiService.getFloors().then(function (response) {
      $scope.floors = response.data.data || [];
      if ($scope.floors.length > 0) {
        $scope.selectedFloor = $scope.floors[0];
        $scope.loadSeatsForFloor();
      }
    });
  };

  $scope.selectFloor = function (floor) {
    $scope.selectedFloor = floor;
    $scope.loadSeatsForFloor();
  };

  $scope.loadSeatsForFloor = function () {
    if (!$scope.selectedFloor) return;
    ApiService.getSeats($scope.selectedFloor._id).then(function (response) {
      $scope.seats = response.data.data || [];
    });
  };

  // Staff Physical Override: Toggle status between Available, Occupied, and Unavailable
  $scope.updatePhysicalStatus = function (seat, newStatus) {
    ApiService.updateSeatStatus(seat._id, newStatus).then(function () {
      seat.status = newStatus;
      seat.physicalStatus = newStatus;
      $scope.loadSummary();
      if (typeof window.renderOccupancyChart === 'function') {
        window.renderOccupancyChart();
      }
    });
  };

  $scope.loadAllBookings = function () {
    ApiService.getAllBookings().then(function (response) {
      $scope.allBookings = response.data.data || [];
    });
  };

  $scope.cancelStudentBooking = function (booking) {
    if (!confirm('Cancel this student reservation and release seat immediately?')) return;
    ApiService.cancelBooking(booking._id).then(function () {
      $scope.loadAllBookings();
      $scope.loadSummary();
      $scope.loadSeatsForFloor();
    });
  };

  $scope.signOut = function () {
    ApiService.logout().finally(function () {
      $window.location.href = '/login.html';
    });
  };

  $scope.init();
}]);
