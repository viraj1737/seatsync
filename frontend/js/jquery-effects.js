/**
 * SeatSync jQuery Micro-Interactions
 * Unit I Syllabus Demonstration: Selectors, DOM Events & Subtle Animations
 * NOTE: Strictly operates on non-Angular decorative elements to preserve scope integrity.
 */
$(document).ready(function () {
  console.log('[SeatSync jQuery] Initialized micro-interaction listeners.');

  // 1. Smooth scrolling for internal anchor links
  $('a[href^="#"]').on('click', function (e) {
    var target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      $('html, body').stop().animate({
        scrollTop: target.offset().top - 80
      }, 350);
    }
  });

  // 2. Global Floating Toast Notification System (jQuery animated)
  window.showSeatSyncToast = function (title, message) {
    var $existingToast = $('#seatsync-toast');
    if ($existingToast.length) {
      $existingToast.remove();
    }

    var toastHtml = `
      <div id="seatsync-toast" style="position: fixed; bottom: 28px; right: 28px; z-index: 9999; display: none; min-width: 300px; max-width: 420px; background: var(--color-surface-overlay); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); color: var(--color-text-primary); border: 1px solid var(--color-border); border-radius: 16px; padding: 16px 20px; box-shadow: var(--shadow-lg); transform-origin: bottom right; animation: toast-in 520ms var(--ease-spring);">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-available); color: #08080A; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0;">✓</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">${title}</div>
            <div style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.4;">${message}</div>
          </div>
        </div>
      </div>
    `;

    $('body').append(toastHtml);
    var $toast = $('#seatsync-toast');

    // jQuery Slide and Fade In
    $toast.fadeIn(220).delay(3800).fadeOut(300, function () {
      $(this).remove();
    });
  };

  // 3. Syllabus evidence: jQuery hover scale on action pills
  $(document).on('mouseenter', '.brand-mark', function () {
    $(this).css('transform', 'rotate(4deg) scale(1.05)');
  }).on('mouseleave', '.brand-mark', function () {
    $(this).css('transform', 'rotate(0deg) scale(1)');
  });

  // 4. Apple Wallet-style spring tilt on the digital library pass.
  //    A tiny real spring integrator (rAF) keeps the card motion fluid and damped.
  (function initPassTilt() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduceMotion || !finePointer) return;

    var passEl = null;
    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;
    var velocityX = 0, velocityY = 0;
    var stiffness = 0.12;
    var damping = 0.78;
    var rafId = null;

    function startLoop() {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    }

    function tick() {
      velocityX = (velocityX + (targetX - currentX) * stiffness) * damping;
      velocityY = (velocityY + (targetY - currentY) * stiffness) * damping;
      currentX += velocityX;
      currentY += velocityY;

      if (passEl) {
        passEl.style.transform =
          'perspective(900px) rotateX(' + currentX.toFixed(3) + 'deg) rotateY(' + currentY.toFixed(3) + 'deg)';
      }

      if (Math.abs(velocityX) + Math.abs(velocityY) > 0.0008 || targetX !== 0 || targetY !== 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        if (passEl) passEl.style.transform = '';
        rafId = null;
      }
    }

    $(document).on('pointermove', '.digital-pass', function (event) {
      var rect = this.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      passEl = this;
      var px = (event.clientX - rect.left) / rect.width;
      var py = (event.clientY - rect.top) / rect.height;

      targetX = (0.5 - py) * 7;
      targetY = (px - 0.5) * 7;
      this.style.setProperty('--pass-shine-x', (px * 100).toFixed(1) + '%');
      this.style.setProperty('--pass-shine-y', (py * 100).toFixed(1) + '%');
      $(this).addClass('is-tilting');
      startLoop();
    }).on('pointerleave', '.digital-pass', function () {
      targetX = 0;
      targetY = 0;
      passEl = this;
      $(this).removeClass('is-tilting');
      startLoop();
    });
  })();
});
