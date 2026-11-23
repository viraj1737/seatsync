/**
 * SeatSync Premium Interactions
 * Ambient light, scroll reveals, scroll-spy and subtle pointer response.
 * Purely presentational — AngularJS behaviour is left untouched.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js-premium');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function injectAtmosphere() {
    if (document.querySelector('.atmosphere')) {
      return;
    }
    var layer = document.createElement('div');
    layer.className = 'atmosphere';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML =
      '<div class="orb orb--one"></div>' +
      '<div class="orb orb--two"></div>' +
      '<div class="orb orb--three"></div>' +
      '<div class="grid"></div>';
    document.body.insertBefore(layer, document.body.firstChild);
  }

  function initScrollState() {
    var update = function () {
      document.body.classList.toggle('is-scrolled', window.pageYOffset > 12);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) {
      return;
    }
    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (item) {
        item.classList.add('is-visible');
      });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(items, function (item) {
      observer.observe(item);
    });

    // Safety net: content must never stay hidden, even if observation is
    // interrupted by a tab resize, a full-page capture or a background tab.
    window.setTimeout(function () {
      Array.prototype.forEach.call(items, function (item) {
        item.classList.add('is-visible');
      });
    }, 1100);
  }

  function initScrollSpy() {
    var links = document.querySelectorAll('.nav-link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) {
      return;
    }
    var sections = [];
    Array.prototype.forEach.call(links, function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) {
        sections.push(section);
      }
    });
    if (!sections.length) {
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        Array.prototype.forEach.call(links, function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initSpotlight() {
    if (reduceMotion || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    var targets = document.querySelectorAll('[data-spotlight]');
    Array.prototype.forEach.call(targets, function (target) {
      var frame = null;
      target.addEventListener('pointermove', function (event) {
        if (frame) {
          return;
        }
        frame = window.requestAnimationFrame(function () {
          var rect = target.getBoundingClientRect();
          target.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
          target.style.setProperty('--my', ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
          frame = null;
        });
      });
      target.addEventListener('pointerleave', function () {
        target.style.removeProperty('--mx');
        target.style.removeProperty('--my');
      });
    });
  }

  function init() {
    injectAtmosphere();
    initScrollState();
    initReveal();
    initScrollSpy();
    initSpotlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
