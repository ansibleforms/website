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
