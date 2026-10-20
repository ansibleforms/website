#!/usr/bin/env bash
# =============================================================================
# Which translated pages are missing, or older than their English page
# =============================================================================
#
# Every translated page (i18n/<code>/<path>) carries, in its front matter, the git
# hash of the English page it was translated from :
#
#   translated_from: 3f1c9e...
#
# When the English page changes, its hash no longer matches, and the translation
# is reported as stale until it is brought up to date and stamped again. A page
# not translated yet is reported as missing : the site shows it in English.
#
# Usage:
#   scripts/i18n-status.sh <code>                 report, as GitHub warnings
#   scripts/i18n-status.sh <code> --stamp <path>  record that <path> (relative to
#                                                 source/) is up to date with its
#                                                 English page, after updating it
#
# Example:
#   scripts/i18n-status.sh es --stamp _configure/runners/registration.md
# =============================================================================

set -euo pipefail

code="${1:?usage: scripts/i18n-status.sh <code> [--stamp <path>...]}"
shift

# The English pages that are translated : everything but the 6.x docs, the pages served
# from the root only (404, Helm charts) and the changelog, which comes from the app
english_pages() {
  (cd source && find . -name '*.md' \
      -not -path './v6/*' -not -path './.jekyll-cache/*' \
      -not -path './helm-charts/*' -not -name '404.md' -not -path './_reference/changelog.md' \
    | sed 's#^\./##' | sort)
}

# -----------------------------------------------------------------------------
# --stamp : write the English page's hash into the translation
# -----------------------------------------------------------------------------

if [ "${1:-}" = "--stamp" ]; then
  shift
  [ $# -gt 0 ] || { echo "usage: scripts/i18n-status.sh <code> --stamp <path>..."; exit 2; }
  for path in "$@"; do
    page="i18n/$code/$path"
    [ -f "$page" ] || { echo "$page does not exist"; exit 1; }
    hash="$(git hash-object "source/$path")"
    # Step 1 : drop the old stamp, then add the new one as the last front matter line
    awk -v hash="$hash" '
      NR == 1 && $0 == "---" { fm = 1; print; next }
      fm && /^translated_from:/ { next }
      fm && $0 == "---" { print "translated_from: " hash; fm = 0 }
      { print }
    ' "$page" > "$page.tmp" && mv "$page.tmp" "$page"
  done
  exit 0
fi

# -----------------------------------------------------------------------------
# The report
# -----------------------------------------------------------------------------

missing=0
stale=0
while IFS= read -r path; do
  page="i18n/$code/$path"
  if [ ! -f "$page" ]; then
    echo "::warning file=source/$path::$code: not translated yet, shown in English"
    missing=$((missing + 1))
    continue
  fi
  stamp="$(sed -n '2,/^---$/{s/^translated_from: *//p}' "$page")"
  if [ "$stamp" != "$(git hash-object "source/$path")" ]; then
    echo "::warning file=$page::$code: the English page changed since it was translated"
    stale=$((stale + 1))
  fi
done < <(english_pages)

echo "$code: $(english_pages | wc -l) pages, $missing not translated, $stale out of date"
