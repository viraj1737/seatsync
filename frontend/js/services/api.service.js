/* All API calls live here. If /api is missing (Vercel static hosting),
   the same call is answered by DemoService using browser storage. */
angular.module('seatSyncApp').service('ApiService', ['$http', '$q', 'DemoService',
  function ($http, $q, DemoService) {

    function call(config, demoMethod) {
      return $http(config).catch(function (error) {
        // 404 = no API on Vercel, 405/501 = static file server cannot handle POST/PATCH
        if ([0, 404, 405, 501].indexOf(error.status) !== -1) {
          return demoMethod();
        }
        return $q.reject(error);
      });
    }

    return {
      register: function (data) {
        return call({ method: 'POST', url: '/api/auth/register', data: data }, function () {
          return DemoService.register(data);
        });
      },

      login: function (credentials) {
        return call({ method: 'POST', url: '/api/auth/login', data: credentials }, function () {
          return DemoService.login(credentials);
        });
      },

      logout: function () {
        return call({ method: 'POST', url: '/api/auth/logout', data: {} }, DemoService.logout);
      },

      getMe: function () {
        return call({ method: 'GET', url: '/api/auth/me' }, DemoService.getMe);
      },

      getFloors: function () {
        return call({ method: 'GET', url: '/api/floors' }, DemoService.getFloors);
      },

      getSeats: function (floorId, date, slot) {
        return call({
          method: 'GET', url: '/api/seats', params: { floorId: floorId, date: date, slot: slot }
        }, function () { return DemoService.getSeats(floorId, date, slot); });
      },

      createBooking: function (data) {
        return call({ method: 'POST', url: '/api/bookings', data: data }, function () {
          return DemoService.createBooking(data);
        });
      },

      getMyBookings: function () {
        return call({ method: 'GET', url: '/api/bookings/mine' }, DemoService.getMyBookings);
      },

      cancelBooking: function (id) {
        return call({ method: 'PATCH', url: '/api/bookings/' + id + '/cancel', data: {} }, function () {
          return DemoService.cancelBooking(id);
        });
      },

      punchExit: function (studentId, barcode) {
        return call({
          method: 'POST', url: '/api/bookings/punch-exit',
          data: { studentId: studentId, barcode: barcode }
        }, DemoService.punchExit);
      },

      getAdminSummary: function () {
        return call({ method: 'GET', url: '/api/admin/summary' }, DemoService.getAdminSummary);
      },

      getAllBookings: function () {
        return call({ method: 'GET', url: '/api/admin/bookings' }, DemoService.getAllBookings);
      },

      updateSeatStatus: function (seatId, status) {
        return call({
          method: 'PATCH', url: '/api/admin/seats/' + seatId, data: { status: status }
        }, function () { return DemoService.updateSeatStatus(seatId, status); });
      },

      getOccupancyAnalytics: function () {
        return call({ method: 'GET', url: '/api/admin/analytics/occupancy' }, DemoService.getOccupancyAnalytics);
      }
    };
  }
]);
