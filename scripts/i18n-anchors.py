#!/usr/bin/env python3
# =============================================================================
# Give the headings of a translated build their English anchors back
# =============================================================================
#
# Kramdown builds a heading's anchor from its text, so a translated heading gets
# a translated anchor : "## Tokens de unión" becomes #tokens-de-unión. The
# translated pages keep their links in English (../runners/registration.html#join-tokens),
# and switching language should keep the reader on the same section, so every
# translated heading takes the anchor of the English heading it translates.
#
# A translated page has the same headings as its English page, in the same order,
# so the two are paired by position. A page whose heading count differs is left
# as it is and reported : it is out of step with its English page.
#
# Rewritten, in the built site of the language :
#   - the id of each heading, and every same-page link to it (the table of
#     contents, the anchor links next to the headings, links written in the page) ;
#   - the section urls of the search index (assets/js/search-data.json).
#
# Usage:
#   python3 scripts/i18n-anchors.py <site directory> <code>
# =============================================================================

import json
import re
import sys
from pathlib import Path

# A heading with an id, as kramdown writes it : <h2 id="join-tokens"> (other attributes may come first)
HEADING_ID = re.compile(r'<h([1-6])\b([^>]*?)\bid="([^"]*)"')


def heading_ids(html):
    """Return the ids of the headings of a page, in document order.

    Args:
        html: the page's HTML.

    Returns:
        The list of heading ids.
    """
    return [m.group(3) for m in HEADING_ID.finditer(html)]


def page_url(rel, code):
    """Return the url a page is served at, as the search index writes it.

    Args:
        rel: the page's path inside the language's build, e.g. runners/index.html.
        code: the language code.

    Returns:
        The url, e.g. /es/runners/.
    """
    url = f"/{code}/{rel}"
    return url[: -len("index.html")] if url.endswith("/index.html") else url


def main():
    """Rewrite the anchors of one language's build.

    Returns:
        The process exit code.
    """
    if len(sys.argv) != 3:
        print("usage: python3 scripts/i18n-anchors.py <site directory> <code>", file=sys.stderr)
        return 2
    site, code = Path(sys.argv[1]), sys.argv[2]
    en_root, lang_root = site / "en", site / code

    # -------------------------------------------------------------------------
    # Step 1 : the pages, heading by heading
    # -------------------------------------------------------------------------
    by_url = {}  # page url -> {translated anchor: English anchor}
    pages = 0
    out_of_step = []
    for page in sorted(lang_root.rglob("*.html")):
        rel = page.relative_to(lang_root).as_posix()
        english = en_root / rel
        if not english.is_file():
            continue
        html = page.read_text(encoding="utf-8")
        ours, theirs = heading_ids(html), heading_ids(english.read_text(encoding="utf-8"))
        if len(ours) != len(theirs):
            out_of_step.append(f"{rel} ({len(ours)} headings, English has {len(theirs)})")
            continue
        mapping = {o: t for o, t in zip(ours, theirs) if o != t}
        if not mapping:
            continue

        # one pass each, so an anchor renamed to another's old name is never renamed twice
        html = HEADING_ID.sub(
            lambda m: f'<h{m.group(1)}{m.group(2)}id="{mapping.get(m.group(3), m.group(3))}"', html
        )
        html = re.sub(r'href="#([^"]*)"', lambda m: f'href="#{mapping.get(m.group(1), m.group(1))}"', html)
        page.write_text(html, encoding="utf-8")
        by_url[page_url(rel, code)] = mapping
        pages += 1

    # -------------------------------------------------------------------------
    # Step 2 : the search index, which links to each section
    # -------------------------------------------------------------------------
    index = lang_root / "assets/js/search-data.json"
    if index.is_file():
        data = json.loads(index.read_text(encoding="utf-8"))
        for entry in data.values():
            for key in ("url", "relUrl"):
                url = entry.get(key, "")
                if "#" not in url:
                    continue
                path, anchor = url.split("#", 1)
                full = path if key == "url" else f"/{code}{path}"
                mapping = by_url.get(full)
                if mapping and anchor in mapping:
                    entry[key] = f"{path}#{mapping[anchor]}"
        index.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    # -------------------------------------------------------------------------
    # Step 3 : the report
    # -------------------------------------------------------------------------
    print(f"{code}: English anchors restored on {pages} pages")
    for line in out_of_step:
        print(f"::warning::{code}: {line} : the anchors were left as they are")
    return 0


if __name__ == "__main__":
    sys.exit(main())
