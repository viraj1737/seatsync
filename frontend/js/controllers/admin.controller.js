/* Admin portal: overview numbers, desk status, bookings and a small chart. */
angular.module('seatSyncApp').controller('AdminController', ['$scope', '$window', 'ApiService',
  function ($scope, $window, ApiService) {

    $scope.currentUser = null;
    $scope.summary = {};
    $scope.floors = [];
    $scope.selectedFloor = null;
    $scope.seats = [];
    $scope.allBookings = [];
    $scope.activeTab = 'overview';

    ApiService.getMe()
      .then(function (response) {
        $scope.currentUser = response.data.data;
        if ($scope.currentUser.role !== 'admin') {
          $window.location.href = '/student.html';
          return;
        }
        $scope.loadSummary();
        $scope.loadFloors();
        $scope.loadBookings();
      })
      .catch(function () { $window.location.href = '/login.html'; });

    $scope.loadSummary = function () {
      ApiService.getAdminSummary().then(function (response) {
        $scope.summary = response.data.data || {};
      });
    };

    $scope.loadFloors = function () {
      ApiService.getFloors().then(function (response) {
        $scope.floors = response.data.data || [];
        if ($scope.floors.length) {
          $scope.selectedFloor = $scope.floors[0];
          $scope.loadSeats();
        }
      });
    };

    $scope.loadSeats = function () {
      if (!$scope.selectedFloor) return;
      ApiService.getSeats($scope.selectedFloor._id).then(function (response) {
        $scope.seats = response.data.data || [];
      });
    };

    $scope.selectFloor = function (floor) {
      $scope.selectedFloor = floor;
      $scope.loadSeats();
    };

    // Staff can mark a desk as free, occupied or under maintenance
    $scope.setSeatStatus = function (seat, status) {
      ApiService.updateSeatStatus(seat._id, status).then(function () {
        seat.status = status;
        $scope.loadSummary();
        $scope.loadChart();
      });
    };

    $scope.loadBookings = function () {
      ApiService.getAllBookings().then(function (response) {
        $scope.allBookings = response.data.data || [];
      });
    };

    $scope.cancelBooking = function (booking) {
      if (!window.confirm('Cancel this reservation?')) return;
      ApiService.cancelBooking(booking._id).then(function () {
        $scope.loadBookings();
        $scope.loadSummary();
        $scope.loadSeats();
        $scope.loadChart();
      });
    };

    // Send occupancy figures to charts.js (D3.js)
    $scope.loadChart = function () {
      ApiService.getOccupancyAnalytics().then(function (response) {
        if (window.renderOccupancyChart) window.renderOccupancyChart(response.data.data || []);
      });
    };

    $scope.signOut = function () {
      ApiService.logout().finally(function () { $window.location.href = '/login.html'; });
    };
  }
]);
