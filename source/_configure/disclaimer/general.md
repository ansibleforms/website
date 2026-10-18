---
layout: default
title: General
parent: Disclaimer
nav_order: 1
---

# General
{: .no_toc }

The list of versions, adding one, and enabling the one users accept
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The list

From 7.3.0 **Settings > Access > Disclaimer** is a list of the disclaimer's versions, one per text as it was agreed to:

| Column | Meaning |
|---|---|
| **Enabled** | Whether this is the version users accept; at most one is enabled |
| **Version** | Its number, counted up from 1 |
| **Title** | The title of its dialog |
| **Published by** | Who added it |
| **Published** | When |
| **Acceptances** | How many users accepted it |

A click on a row, or **Edit** in its row menu, opens the [version's page](versions.html). The menu also has **Enable** or **Disable**, and **Delete**.

---

## Adding a version

**Add disclaimer** opens a dialog for a new version, with the next number, which is not enabled until you enable it:

| Field | Meaning |
|---|---|
| **Title** | The title of the dialog, such as Terms of use |
| **Text** | What users agree to, at most 20000 characters. Plain text: line breaks are kept. |
| **Checkbox** | What users tick before they can accept, at first "I have read and agree to these terms." |

All three are required. The version enabled until then stays the one users accept, so a new text can be prepared ahead of time.

---

## Enabling a version

**Enable** in a row menu, or the **Enabled** switch on the version's page, makes that version the one users accept and turns the
others off.

Users who already accepted that version are not asked again, so an earlier version can be enabled again without asking everyone.
**Disable** on the enabled version turns the disclaimer off until a version is enabled again; the versions and acceptances stay.
Deleting a version deletes its acceptances too, and deleting the enabled one turns the disclaimer off.
