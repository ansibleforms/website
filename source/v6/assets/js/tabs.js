// Tabs : <div class="af-tabs" data-tab-group="..."> with .af-tab buttons and .af-tab-panel
// panels sharing a data-tab name. Tabs of the same group switch together on the page, and
// the choice is remembered (per viewer, in this browser) for the next page that has them.
// Tabs can be nested (a distribution choice inside each engine tab) : a tab set only ever
// touches its own buttons and panels, never those of a set inside one of its panels.
(function () {
  'use strict';

  function remembered(group) {
    try { return localStorage.getItem('af-tab-' + group); } catch (e) { return null; }
  }

  function remember(group, name) {
    try { localStorage.setItem('af-tab-' + group, name); } catch (e) { /* private window : not kept */ }
  }

  function own(tabs, selector) {
    return Array.prototype.filter.call(tabs.querySelectorAll(selector), function (el) {
      return el.closest('.af-tabs') === tabs;
    });
  }

  function select(group, name) {
    document.querySelectorAll('.af-tabs[data-tab-group="' + group + '"]').forEach(function (tabs) {
      if (!own(tabs, '.af-tab[data-tab="' + name + '"]').length) return;
      own(tabs, '.af-tab').forEach(function (tab) {
        var on = tab.getAttribute('data-tab') === name;
        tab.setAttribute('aria-selected', on);
        tab.tabIndex = on ? 0 : -1;
      });
      own(tabs, '.af-tab-panel').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-tab') !== name;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var groups = {};
    document.querySelectorAll('.af-tabs').forEach(function (tabs) {
      var group = tabs.getAttribute('data-tab-group');
      groups[group] = true;
      own(tabs, '.af-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          var name = tab.getAttribute('data-tab');
          select(group, name);
          remember(group, name);
        });
        // arrow keys move between the tabs of one list
        tab.addEventListener('keydown', function (e) {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          var all = own(tabs, '.af-tab');
          var next = all[(all.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
          next.click();
          next.focus();
        });
      });
    });
    Object.keys(groups).forEach(function (group) {
      var name = remembered(group);
      if (name) select(group, name);
    });
  });
})();
