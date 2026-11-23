/**
 * SeatSync Theme Toggle (Light ↔ Black)
 * The OLED black theme is the default. The toggle stores the user's choice in
 * localStorage and switches tokens via <html data-theme="light">.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'seatsync-theme';
  var root = document.documentElement;
  var switchTimer = null;

  function readSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      /* Private browsing / storage disabled — toggle still works for this page. */
    }
  }

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function animateSwitch() {
    root.classList.add('theme-switching');
    if (switchTimer) {
      window.clearTimeout(switchTimer);
    }
    switchTimer = window.setTimeout(function () {
      root.classList.remove('theme-switching');
    }, 420);
  }

  function updateToggleButtons(theme) {
    var isLight = theme === 'light';
    var label = isLight ? 'Switch to black theme' : 'Switch to light theme';

    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-toggle]'), function (button) {
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      button.classList.toggle('is-light', isLight);
    });
  }

  function updateMeta(theme) {
    var themeColor = document.querySelector('meta[name="theme-color"]');
    var colorScheme = document.querySelector('meta[name="color-scheme"]');

    if (themeColor) {
      themeColor.setAttribute('content', theme === 'light' ? '#F5F5F7' : '#08080A');
    }
    if (colorScheme) {
      colorScheme.setAttribute('content', theme === 'light' ? 'light' : 'dark');
    }
  }

  function refreshCharts() {
    if (typeof window.renderOccupancyChart === 'function' && document.getElementById('d3-occupancy-chart')) {
      window.setTimeout(function () {
        try {
          window.renderOccupancyChart();
        } catch (error) {
          /* Chart is optional — ignore if D3 is unavailable. */
        }
      }, 80);
    }
  }

  function applyTheme(theme, options) {
    var settings = options || {};

    if (settings.animate) {
      animateSwitch();
    }

    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    updateMeta(theme);
    updateToggleButtons(theme);

    if (settings.persist) {
      saveTheme(theme);
    }

    if (settings.refreshCharts !== false) {
      refreshCharts();
    }

    document.dispatchEvent(new CustomEvent('seatsync:themechange', {
      bubbles: true,
      detail: { theme: theme }
    }));
  }

  function toggleTheme() {
    applyTheme(currentTheme() === 'light' ? 'dark' : 'light', {
      persist: true,
      animate: true
    });
  }

  function init() {
    // The inline head snippet already applied the saved theme before paint;
    // this keeps meta tags, labels and charts in sync after load.
    applyTheme(readSavedTheme() === 'light' ? 'light' : 'dark', {
      animate: false,
      refreshCharts: false
    });

    document.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('[data-theme-toggle]') : null;
      if (!button) {
        return;
      }
      event.preventDefault();
      toggleTheme();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
