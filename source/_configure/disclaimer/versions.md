---
layout: default
title: Versions
parent: Disclaimer
nav_order: 2
---

# Versions
{: .no_toc }

A version's page, and changing its text as a correction or for everyone again
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## A version's page

From 7.3.0 each version has a page of its own, at `/settings/disclaimer/<version>`, with two tabs:

| Tab | What it holds |
|---|---|
| **Details** | The title, text and checkbox label, and the **Enabled** switch, which is saved at once |
| **Acceptances** | Who accepted this version, see [Acceptances](acceptances.html) |

**Preview** shows the dialog as users will see it, and **Delete** removes the version with its acceptances. The search box above the
tabs searches both at once: the matching fields under **Details** and the matching rows under **Acceptances**.

---

## Changing the text

**Save** on a changed title, text or checkbox label that users already accepted asks **Ask everyone again?**:

| Answer | What happens |
|---|---|
| **Ask everyone again** | The acceptances of this version are cleared, and every user accepts it again at their next request |
| **Keep as a correction** | The text is rewritten, such as for a typo, and the acceptances still count: no one is asked again |

A version nobody accepted yet is saved without asking. To keep the agreed text, [add a new version](general.html#adding-a-version) and enable it.
