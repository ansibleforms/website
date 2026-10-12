---
layout: default
title: Appearance
nav_order: 8
---

# Appearance
{: .no_toc }

The defaults, the name, the logo, the browser icon, the header links and the environment label
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: make the instance look like yours, under **Settings > Appearance**, with the `showSettings` role option.

The pages of this group are **Defaults**, **Name**, **Logo**, **Icon**, **Links**, **Environment** and **Announcements**;
announcements have a page of their own, [Announcements](announcements.html). A saved default, name, link or label
shows at once in every open browser.

---

## Defaults

**Defaults** sets how the app looks for a user who has not made a choice of their own in their
[preferences](profile/preferences.html); a user's own choice always wins:

| Field | Choices | Without a choice |
|---|---|---|
| **Default theme** | Light, Dark or Color, with one of 12 colours for Color | Light |
| **Default language** | The languages of the app, kept in [`DEFAULT_LANGUAGE`](customization/server.html#env_DEFAULT_LANGUAGE) | English |
| **Default forms view** | Tiles or List, for the forms page | Tiles |
| **Default time zone** | UTC, each user's browser, or any zone by name | UTC |
| **Default date format** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` or `DD.MM.YYYY`, shown with today's date | `YYYY-MM-DD` |

The language is an environment variable and applies without a restart. With
[`ALLOW_ENV_EDIT`](customization/configuration.html#env_ALLOW_ENV_EDIT) set to `0` the page shows it read-only.

---

## Name

**Name** holds the **Application name**, shown in the browser tab and on the sign-in page; empty, it is Ansible Forms.

---

## Logo

**Logo** replaces the AnsibleForms logo in the header with your own image, shown in every theme:

| Rule | Value |
|---|---|
| Types | PNG, JPEG, WEBP, GIF and SVG |
| Largest file | 900 KB |
| Size in the header | At most 200 × 33 px, its proportions kept |

Pick a file under **New logo** to preview it, then click **Upload**. **Current logo** shows the logo in use and the size
the header shows it at. **Remove custom logo** brings back the default logo, which follows the theme.

---

## Icon

**Icon** replaces the icon of AnsibleForms in the browser tab and in bookmarks:

| Rule | Value |
|---|---|
| Types | PNG, ICO, SVG, WEBP, GIF and JPEG |
| Largest file | 256 KB |
| Best result | A square image of at least 64 × 64 px, or an SVG |

Pick a file under **New icon** and click **Upload**; **Remove custom icon** brings back the default icon.

---

## Links

**Links** sets the links of the header, for every signed-in user, in two tabs.

**Built-in** has the **Designer** switch, kept in [`SHOW_DESIGNER`](customization/features.html#env_SHOW_DESIGNER) and applied
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

---

## Environment

**Environment** sets a label beside the header's logo that says which instance this is, such as PRODUCTION or TEST:

| Field | Meaning |
|---|---|
| **Show environment label** | Shows the label; switched off, the fields below are kept as they are |
| **Label text** | The text of the label |
| **Label color** | Blue, green, amber, orange, red or grey; red by default |

**Preview** shows the header's logo with the label, in the current theme.
