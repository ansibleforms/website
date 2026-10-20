#!/usr/bin/env python3
# =============================================================================
# Keep the pages that are not translated yet in the menu of a translated build
# =============================================================================
#
# The menu links a page to its parent by title (parent: and grand_parent: name the
# parent's title:). A page not translated yet is built in English, so it still names
# its parent in English ("parent: Credentials") while the translated parent is now
# called "Credenciales" : the page would drop out of the menu tree.
#
# This rewrites, in the assembled source of the language (scripts/build-language.sh),
# the parent: and grand_parent: of every page that is not translated, through the
# titles of the pages that are : English title -> translated title.
#
# Usage:
#   python3 scripts/i18n-fallback.py <assembled source> <code>
# =============================================================================

import re
import sys
from pathlib import Path

# One front matter line of the keys that matter here : title: Credentials, quoted or not
KEY_LINE = re.compile(r'^(title|parent|grand_parent):\s*(.*?)\s*$')


def front_matter_keys(text):
    """Return the title, parent and grand_parent of a page's front matter.

    Args:
        text: the page's content.

    Returns:
        A dict of the keys found, their values unquoted.
    """
    found = {}
    if not text.startswith("---\n"):
        return found
    for line in text.split("\n")[1:]:
        if line == "---":
            break
        m = KEY_LINE.match(line)
        if m:
            found[m.group(1)] = m.group(2).strip('"').strip("'")
    return found


def main():
    """Rewrite the parents of the untranslated pages of one language.

    Returns:
        The process exit code.
    """
    if len(sys.argv) != 3:
        print("usage: python3 scripts/i18n-fallback.py <assembled source> <code>", file=sys.stderr)
        return 2
    work, code = Path(sys.argv[1]), sys.argv[2]
    english_root, translated_root = Path("source"), Path("i18n") / code

    # Step 1 : English title -> translated title, from every translated page
    titles = {}
    for page in translated_root.rglob("*.md"):
        rel = page.relative_to(translated_root)
        english = english_root / rel
        if not english.is_file():
            continue
        en = front_matter_keys(english.read_text(encoding="utf-8")).get("title")
        tr = front_matter_keys(page.read_text(encoding="utf-8")).get("title")
        if en and tr:
            titles[en] = tr

    # Step 2 : the parents of every page that is not translated
    rewritten = 0
    for page in work.rglob("*.md"):
        rel = page.relative_to(work)
        if (translated_root / rel).is_file() or not (english_root / rel).is_file():
            continue
        lines = page.read_text(encoding="utf-8").split("\n")
        if not lines or lines[0] != "---":
            continue
        changed = False
        for i, line in enumerate(lines[1:], start=1):
            if line == "---":
                break
            m = KEY_LINE.match(line)
            if m and m.group(1) in ("parent", "grand_parent"):
                value = m.group(2).strip('"').strip("'")
                if value in titles:
                    lines[i] = f'{m.group(1)}: "{titles[value]}"'
                    changed = True
        if changed:
            page.write_text("\n".join(lines), encoding="utf-8")
            rewritten += 1

    print(f"{code}: {rewritten} untranslated pages kept under their translated parent")
    return 0


if __name__ == "__main__":
    sys.exit(main())
