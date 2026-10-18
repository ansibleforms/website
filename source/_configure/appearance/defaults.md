---
layout: default
title: Defaults
parent: Appearance
nav_order: 1
---

# Defaults
{: .no_toc }

The theme, language, time zone and date format for users who chose none
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The defaults

**Defaults** sets how the app looks for a user who has not made a choice of their own in their
[preferences](../profile/preferences.html); a user's own choice always wins:

| Field | Choices | Without a choice |
|---|---|---|
| **Default theme** | Follow the browser, Light, Dark or Color, with one of 12 colours for Color | Follow the browser (Light up to 7.2) |
| **Default language** | The languages of the app, kept in [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | English |
| **Default forms view** | Tiles or List, for the forms page | Tiles |
| **Default time zone** | UTC, each user's browser, or any zone by name | UTC |
| **Default date format** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` or `DD.MM.YYYY`, shown with today's date | `YYYY-MM-DD` |

The language is an environment variable and applies without a restart. With
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) set to `0` the page shows it read-only.

From 7.3.0 the page is in the two tabs of the profile's preferences, **Appearance** (theme, language and forms view) and **Date and
time** (time zone and date format, with a preview of the time now), and its search box lists the matches under each tab's name.

---

## Following the browser

From 7.3.0 **Follow the browser** shows each user the light or dark theme their browser asks for, and changes with it.

It is the default when no default theme is chosen, so a new installation follows the browser. Hovering one of the colours of
**Color** previews the app in that colour; the theme you had comes back when the pointer leaves, and nothing is kept until **Save**.
