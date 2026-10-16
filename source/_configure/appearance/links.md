---
layout: default
title: Links
parent: Appearance
nav_order: 5
---

# Links
{: .no_toc }

The links of the header, built-in and your own
{: .fs-6 .fw-300 }

**Links** sets the links of the header, for every signed-in user, in two tabs.

**Built-in** has the **Designer** switch, kept in [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER) and applied
without a restart. Switched off, the designer is gone for everyone: its link, its page and its API.

**Custom** holds your own links, such as a wiki, a runbook or a support portal. **Add link** adds a row with these fields:

| Field | Meaning |
|---|---|
| **Icon** | The icon before the label, picked from a list |
| **Label** | The text of the link |
| **Address** | A site (`https://…`) or a page of the app (`/forms/all`) |
| **New tab** | Opens the link in a new browser tab |

The buttons of a row move it: **→** puts the link inside the link above it, which then opens as a menu in the header,
**←** takes it back out to the header, and the arrows up and down move it (a menu with the links inside it).
A menu needs no address of its own.

The header holds at most 5 of your links after the built-in ones, and at most 10 inside each menu.
