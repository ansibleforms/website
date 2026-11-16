// Language selector in the header (_includes/language_select.html) : the flag button
// opens the menu, a click outside it or Escape closes it again, and the language
// picked is remembered for the next visit.
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const item = document.querySelector('.af-lang');
    if (!item) {
      return;
    }
    const button = item.querySelector('.af-lang-button');
    const menu = item.querySelector('.af-lang-menu');

    // Open or close the menu, keeping aria-expanded in step for screen readers
    // Where the page was scrolled before the menu opened, to scroll back there on close
    let scrollBefore = null;

    function setOpen(open) {
      const wasOpen = !menu.hidden;
      menu.hidden = !open;
      button.setAttribute('aria-expanded', open ? 'true' : 'false');

      // On a phone the header opens below the navigation, near the bottom of the
      // screen, so the list of languages would run past it : scroll it into view,
      // and back to where the page was once it closes
      if (open && !wasOpen) {
        scrollBefore = window.scrollY;
        menu.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else if (!open && wasOpen && scrollBefore !== null) {
        window.scrollTo({ top: scrollBefore, behavior: 'smooth' });
        scrollBefore = null;
      }
    }

    button.addEventListener('click', function(e) {
      e.stopPropagation();
      setOpen(menu.hidden);
    });

    // The language picked is remembered : the root of the site and the old addresses
    // (scripts/redirects.sh) send the reader to it next time, before the browser's language
    menu.querySelectorAll('a[hreflang]').forEach(function(link) {
      link.addEventListener('click', function() {
        try {
          localStorage.setItem('af-lang', link.getAttribute('hreflang'));
        } catch (e) {
          // private browsing or storage turned off : the choice is simply not remembered
        }
      });
    });

    // A click anywhere else closes it
    document.addEventListener('click', function(e) {
      if (!item.contains(e.target)) {
        setOpen(false);
      }
    });

    // Escape closes it and gives the focus back to the button
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !menu.hidden) {
        setOpen(false);
        button.focus();
      }
    });
  });
})();
