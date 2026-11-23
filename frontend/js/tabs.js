/**
 * SeatSync — Tab keyboard support and URL state.
 * Works with the AngularJS tab switches already in the pages: this file only
 * adds Arrow/Home/End navigation, roving tabindex and a shareable ?tab= value.
 */
(function () {
  'use strict';

  var PARAM = 'tab';

  function tabLists() {
    return Array.prototype.slice.call(document.querySelectorAll('[role="tablist"]'));
  }

  function tabsIn(list) {
    return Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  }

  function isSelected(tab) {
    return tab.getAttribute('aria-selected') === 'true';
  }

  function select(tab) {
    if (!tab || isSelected(tab)) {
      return;
    }
    tab.click();
  }

  function syncUrl(tab) {
    if (!tab || !tab.getAttribute('data-tab-value')) {
      return;
    }
    try {
      var url = new URL(window.location.href);
      url.searchParams.set(PARAM, tab.getAttribute('data-tab-value'));
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (error) {
      /* Older browsers: skip URL sync, tabs still work. */
    }
  }

  function onKeydown(event) {
    var list = event.currentTarget;
    var tabs = tabsIn(list);
    if (!tabs.length) {
      return;
    }

    var index = tabs.indexOf(document.activeElement);
    if (index < 0) {
      return;
    }

    var next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = tabs[(index + 1) % tabs.length];
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = tabs[(index - 1 + tabs.length) % tabs.length];
    } else if (event.key === 'Home') {
      next = tabs[0];
    } else if (event.key === 'End') {
      next = tabs[tabs.length - 1];
    }

    if (next) {
      event.preventDefault();
      next.focus();
      select(next);
    }
  }

  function onTabClick(event) {
    var tab = event.currentTarget;
    syncUrl(tab);
    // AngularJS updates aria-selected on the next digest, after this handler.
    window.setTimeout(function () {
      tabLists().forEach(function (list) {
        tabsIn(list).forEach(function (item) {
          item.setAttribute('tabindex', isSelected(item) ? '0' : '-1');
        });
      });
    }, 0);
  }

  function applyUrlState() {
    var requested;
    try {
      requested = new URL(window.location.href).searchParams.get(PARAM);
    } catch (error) {
      return;
    }
    if (!requested) {
      return;
    }
    tabLists().forEach(function (list) {
      tabsIn(list).forEach(function (tab) {
        if (tab.getAttribute('data-tab-value') === requested) {
          select(tab);
        }
      });
    });
  }

  function init() {
    tabLists().forEach(function (list) {
      list.addEventListener('keydown', onKeydown);
      tabsIn(list).forEach(function (tab) {
        tab.addEventListener('click', onTabClick);
      });
    });

    // Wait for AngularJS to interpolate aria-selected before reading it.
    window.setTimeout(function () {
      tabLists().forEach(function (list) {
        tabsIn(list).forEach(function (tab) {
          tab.setAttribute('tabindex', isSelected(tab) ? '0' : '-1');
        });
      });
      applyUrlState();
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
