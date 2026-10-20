---
---
// The theme's search writes "No results found" in English (just-the-docs.js) : this puts
// the message of the docs language (_data/ui.yml) in its place as soon as it appears.
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const results = document.getElementById('search-results');
    if (!results) {
      return;
    }
    new MutationObserver(function() {
      const none = results.querySelector('.search-no-result');
      const text = '{{ site.data.ui[site.docs_language].no_results }}';
      // only when it differs : writing the text is itself a change the observer sees
      if (none && none.textContent !== text) {
        none.textContent = text;
      }
    }).observe(results, { childList: true, subtree: true });
  });
})();
