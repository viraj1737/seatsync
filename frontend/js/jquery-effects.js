/* A small jQuery toast. The controllers call this after booking or exit. */
window.showSeatSyncToast = function (title, message, isError) {
  var old = document.getElementById('seatSyncToast');
  if (old) $(old).remove();

  var $toast = $('<div id="seatSyncToast" class="toast"></div>');
  if (isError) $toast.addClass('toast-error');
  $toast.append($('<strong></strong>').text(title));
  $toast.append($('<span></span>').text(message));
  $('body').append($toast);

  setTimeout(function () {
    $toast.fadeOut(300, function () { $(this).remove(); });
  }, 4000);
};
