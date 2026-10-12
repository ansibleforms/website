---
layout: default
title: Preferences
parent: Your profile
nav_order: 2
---

# Preferences
{: .no_toc }

Language, theme, time zone and date format
{: .fs-6 .fw-300 }

---

The Preferences view changes how AnsibleForms looks for you. Each choice is stored in the browser
where you make it, so another browser or computer starts from the defaults.

| Setting | Choices | Also set from |
|---|---|---|
| Language | English, Nederlands, Français, Italiano, Deutsch, Español | the flag in the header |
| Theme | Light, Dark, or Color (a header in a color you pick) | the sun icon in the header |
| Forms view | Tiles or List | the button on the Forms page |
| Time zone | UTC, this browser's zone, or any zone by name | only here |
| Date format | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` or `DD.MM.YYYY` | only here |

---

## Time zone

Dates and times across AnsibleForms are shown in the time zone you select. This includes job start
and end times, the audit log, the status page, backups, stored jobs, and the expiry of an API
token. Changing the time zone updates every page immediately, without a reload.

Until you pick one, the time zone your administrator set for everyone applies (**Settings > Appearance > Defaults**, see
[Appearance](../appearance.html)), **UTC** unless changed. **This browser** follows the time zone of your computer, and the
list contains every zone by name, such as `Europe/Madrid`. The card shows the current time in the selected zone and format.

---

## Date format

The date format sets how the date part of every date reads, each choice shown with today's date: `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` or `DD.MM.YYYY`. Until you pick one, your administrator's default date format
applies, `YYYY-MM-DD` unless changed. Like the other choices, it is kept in this browser.

---

## What keeps the server's times

Two exceptions keep the server's own times:

- **The server log and job output** are text containing the times the server wrote into them.
- **Times you enter**, such as when a planned job should run, and cron schedules, work as
  before.
