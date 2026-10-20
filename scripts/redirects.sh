#!/usr/bin/env bash
# =============================================================================
# Redirects from the old addresses to the docs in the reader's language
# =============================================================================
#
# The docs used to live at the root of the site (ansibleforms.com/seed), and they
# now live under a language prefix (ansibleforms.com/en/seed, /es/seed). Released
# versions of the app, the installer, READMEs, search engines and bookmarks all
# still point at the old addresses, so every one of them has to keep working, and
# the root itself (ansibleforms.com/) is one of them.
#
# GitHub Pages cannot send real HTTP redirects, so this writes a small page at
# every old address instead. It sends the browser on at once, keeping the query
# string and the #anchor, to the same page in :
#   1. the language the reader last picked in the language selector, if any
#      (assets/js/language-select.js keeps it in localStorage, af-lang) ;
#   2. otherwise the first of the browser's languages the docs are written in ;
#   3. otherwise English.
# Without JavaScript it goes to English. A canonical link points search engines at
# the English page, never at the redirect.
#
# A file that already exists at the root is never overwritten : /install,
# /helm-charts/ and /404.html stay where they are, served as they are.
#
# Usage:
#   scripts/redirects.sh <site directory> [<base path>]
#
# Args:
#   site directory : the built site, holding the English docs in its en/ folder
#   base path      : the path the site is served under, empty for the custom domain
#
# Example:
#   scripts/redirects.sh _site ""
# =============================================================================

set -euo pipefail

site="${1:?usage: scripts/redirects.sh <site directory> [<base path>]}"
base="${2:-}"
url="${SITE_URL:-https://ansibleforms.com}"

[ -d "$site/en" ] || { echo "::error::$site/en does not exist : build the English docs first."; exit 1; }

# The languages built : every two-letter folder at the root of the site, as a JavaScript array
langs="$(find "$site" -mindepth 1 -maxdepth 1 -type d -regex '.*/[a-z][a-z]' -printf '"%f",' | sed 's/,$//')"

# -----------------------------------------------------------------------------
# One redirect page for every page
# -----------------------------------------------------------------------------

written=0
kept=0
while IFS= read -r -d '' page; do
  # Step 1 : the old address of the page, relative to the site root
  rel="${page#"$site/en/"}"
  old="$site/$rel"

  # Step 2 : a file the site serves at the root itself wins over its redirect
  if [ -e "$old" ]; then
    kept=$((kept + 1))
    continue
  fi

  # Step 3 : the page's address inside a language, with index.html dropped as the browser shows it
  path="/$rel"
  path="${path%index.html}"
  target="$base/en$path"

  # Step 4 : the redirect page itself
  mkdir -p "$(dirname "$old")"
  cat > "$old" <<EOF
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="$url/en$path">
<meta name="robots" content="noindex">
<script>
var langs = [$langs], lang = null;
try { lang = localStorage.getItem("af-lang"); } catch (e) {}
if (langs.indexOf(lang) < 0) {
  lang = "en";
  var wanted = navigator.languages || [navigator.language || ""];
  for (var i = 0; i < wanted.length; i++) {
    var code = String(wanted[i]).slice(0, 2).toLowerCase();
    if (langs.indexOf(code) >= 0) { lang = code; break; }
  }
}
location.replace("$base/" + lang + "$path" + location.search + location.hash);
</script>
<noscript><meta http-equiv="refresh" content="0; url=$target"></noscript>
</head>
<body>
<p>This page has moved to <a href="$target">$url/en$path</a>.</p>
</body>
</html>
EOF
  written=$((written + 1))
done < <(find "$site/en" -type f -name '*.html' -not -path "$site/en/404.html" -print0)

echo "Wrote $written redirects to the languages [$langs], kept $kept pages already served at the root"
