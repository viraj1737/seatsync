/**
 * SeatSync API Service
 * Centralizes all $http requests for Student and Admin operations
 */
angular.module('seatSyncApp').service('ApiService', ['$http', function ($http) {
  const baseUrl = '/api';

  // Auth
  this.register = function (userData) {
    return $http.post(baseUrl + '/auth/register', userData);
  };

  this.login = function (credentials) {
    return $http.post(baseUrl + '/auth/login', credentials);
  };

  this.logout = function () {
    return $http.post(baseUrl + '/auth/logout', {});
  };

  this.getMe = function () {
    return $http.get(baseUrl + '/auth/me');
  };

  // Floors & Seats
  this.getFloors = function () {
    return $http.get(baseUrl + '/floors');
  };

  this.getSeats = function (floorId, date, slot) {
    return $http.get(baseUrl + '/seats', {
      params: { floorId: floorId, date: date, slot: slot }
    });
  };

  // Bookings & RFID Punch Exit
  this.createBooking = function (bookingData) {
    return $http.post(baseUrl + '/bookings', bookingData);
  };

  this.getMyBookings = function () {
    return $http.get(baseUrl + '/bookings/mine');
  };

  this.cancelBooking = function (bookingId) {
    return $http.patch(baseUrl + '/bookings/' + bookingId + '/cancel', {});
  };

  // Turnstile RFID Smart Card Punch Exit
  this.punchExit = function (studentId, barcode) {
    return $http.post(baseUrl + '/bookings/punch-exit', { studentId: studentId, barcode: barcode });
  };

  // Admin Operations
  this.getAdminSummary = function () {
    return $http.get(baseUrl + '/admin/summary');
  };

  this.getAllBookings = function () {
    return $http.get(baseUrl + '/admin/bookings');
  };

  this.updateSeatStatus = function (seatId, status) {
    return $http.patch(baseUrl + '/admin/seats/' + seatId, { status: status });
  };

  this.getOccupancyAnalytics = function () {
    return $http.get(baseUrl + '/admin/analytics/occupancy');
  };
}]);
