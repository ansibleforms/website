// ---------------------------------------------------------------------------------------
// Menu groups : the heading of a collapsible group (nav_fold in _config.yml) toggles it
// too, not only the small arrow the theme puts next to it.
// ---------------------------------------------------------------------------------------

document.addEventListener('click', function (event) {
  var heading = event.target.closest('.nav-category-list .nav-category');
  if (!heading) return;
  // the arrow is the heading's previous sibling : clicking it runs the theme's own toggle
  var expander = heading.parentElement.querySelector(':scope > .nav-list-expander');
  if (expander) expander.click();
});

// ---------------------------------------------------------------------------------------
// Phone menu : while it is open the page behind it is hidden (custom.scss), so the window
// scrolls back to the top. Remember where the page was when the menu opens and go back there
// when it closes. The listener captures, so it runs before the theme's own toggle.
// ---------------------------------------------------------------------------------------

var pageScrollBeforeMenu = 0;

document.addEventListener('click', function (event) {
  if (!event.target.closest('#menu-button')) return;
  var nav = document.querySelector('.side-bar .site-nav');
  if (!nav) return;
  if (!nav.classList.contains('nav-open')) {
    pageScrollBeforeMenu = window.scrollY;
    return;
  }
  // closing : the theme shows the page again in its own handler, restore after it ran.
  // Instant, or the site's smooth scrolling would slide the page down from the top
  requestAnimationFrame(function () {
    window.scrollTo({ top: pageScrollBeforeMenu, behavior: 'instant' });
  });
}, true);
