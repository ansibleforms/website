#!/usr/bin/env bash
# =============================================================================
# Build the docs of one language into <site directory>/<code>/
# =============================================================================
#
# English is written in source/ and built from there. Every other language is
# built from a copy of source/ with its translated pages laid over it
# (i18n/<code>/, the same paths as in source/) and its settings read after the
# English ones (i18n/<code>.yml) : the layouts, includes, styles and images are
# shared, and a page that is not translated yet shows in English rather than
# going missing.
#
# The install script, the Helm repository page and the 404 page are served from
# the root of the site, never from a language : the English build hands them to
# the root, the other languages drop their copy.
#
# Spanish headings get their English anchors back afterwards (scripts/i18n-anchors.py),
# so a link to /es/page.html#some-section works like the English one.
#
# Usage:
#   scripts/build-language.sh <code> <site directory> [<base path>]
#
# Args:
#   code           : the language, as listed in docs_languages (source/_config.yml)
#   site directory : where the whole site is assembled, e.g. _site
#   base path      : the path the site is served under, empty for the custom domain
#
# Example:
#   scripts/build-language.sh es _site ""
# =============================================================================

set -euo pipefail

code="${1:?usage: scripts/build-language.sh <code> <site directory> [<base path>]}"
site="${2:?usage: scripts/build-language.sh <code> <site directory> [<base path>]}"
base="${3:-}"
out="$site/$code"

# -----------------------------------------------------------------------------
# English : straight from source/
# -----------------------------------------------------------------------------

if [ "$code" = "en" ]; then
  bundle exec jekyll build --source source --destination "$out" --baseurl "$base/en"
  # Step 1 : the pages served from the root move there
  mv "$out/install" "$out/helm-charts" "$out/404.html" "$site/"
  exit 0
fi

# -----------------------------------------------------------------------------
# Another language : source/ with i18n/<code>/ laid over it
# -----------------------------------------------------------------------------

[ -f "i18n/$code.yml" ] || { echo "::error::i18n/$code.yml does not exist : no settings for language $code."; exit 1; }
[ -d "$site/en" ] || { echo "::error::$site/en does not exist : build English first, its anchors are reused."; exit 1; }

# Step 1 : a copy of the English source, without the 6.x docs, with the translations on top
work="_build/$code"
rm -rf "$work"
mkdir -p "$work"
cp -a source/. "$work/"
rm -rf "$work/v6" "$work/.jekyll-cache"
if [ -d "i18n/$code" ]; then
  cp -a "i18n/$code/." "$work/"
fi

# Step 2 : the pages not translated yet stay under their translated parent in the menu
python3 scripts/i18n-fallback.py "$work" "$code"

# Step 3 : the build, with the language's settings over the English ones
bundle exec jekyll build --source "$work" --config "source/_config.yml,i18n/$code.yml" \
  --destination "$out" --baseurl "$base/$code"

# Step 4 : the pages served from the root are the English build's
rm -rf "$out/install" "$out/helm-charts" "$out/404.html"

# Step 5 : the English anchors on the translated headings
python3 scripts/i18n-anchors.py "$site" "$code"
