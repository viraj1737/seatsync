/**
 * SeatSync Custom AngularJS Directive: <seat-badge>
 * Unit II Syllabus Demonstration: Custom Directives in AngularJS 1.x
 * Usage: <seat-badge status="seat.status"></seat-badge>
 */
angular.module('seatSyncApp').directive('seatBadge', function () {
  return {
    restrict: 'E',
    scope: {
      status: '=',
      label: '@?'
    },
    template: `
      <span class="badge" ng-class="{
        'badge-available': status === 'available' || status === 'confirmed',
        'badge-reserved': status === 'reserved',
        'badge-occupied': status === 'occupied',
        'badge-unavailable': status === 'unavailable' || status === 'cancelled'
      }">
        <span class="badge-dot"></span>
        <span>{{ label || (status | uppercase) }}</span>
      </span>
    `
  };
});

/**
 * Custom AngularJS Filter: formatSlot
 * Formats slot code (e.g., '09:00-11:00') into friendly readable format
 */
angular.module('seatSyncApp').filter('formatSlot', function () {
  return function (slotCode) {
    if (!slotCode) return '';
    var map = {
      '09:00-11:00': '09:00 AM – 11:00 AM (Morning)',
      '11:00-13:00': '11:00 AM – 01:00 PM (Midday)',
      '13:00-15:00': '01:00 PM – 03:00 PM (Afternoon)',
      '15:00-17:00': '03:00 PM – 05:00 PM (Evening)',
      '17:00-19:00': '05:00 PM – 07:00 PM (Night)'
    };
    return map[slotCode] || slotCode;
  };
});
