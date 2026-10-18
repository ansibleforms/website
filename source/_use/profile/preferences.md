---
layout: default
title: Preferences
parent: Your profile
nav_order: 2
---

# Preferences
{: .no_toc }

Language, theme, time zone, date format and desktop notifications
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The preferences

The Preferences view changes how AnsibleForms looks for you. Each choice is stored in the browser
where you make it, so another browser or computer starts from the defaults.

| Setting | Choices | Also set from |
|---|---|---|
| Language | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (Japanese), 简体中文 (Simplified Chinese) | the flag in the header |
| Theme | Follow the browser, Light, Dark, or Color (a header in a color you pick) | the sun icon in the header |
| Forms view | Tiles or List | the button on the Forms page |
| Time zone | UTC, this browser's zone, or any zone by name | only here |
| Date format | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` or `DD.MM.YYYY` | only here |
| Desktop notifications | On or off | only here |

From 7.3.0 the view is in tabs, each at its own address (`/profile/preferences/<tab>`): **Appearance** (language, theme and forms
view), **Date and time** (time zone and date format) and **Notifications**. The search box above them lists the settings that match
under their tab's name. A choice is a draft until **Save**, and leaving the view with a change unsaved asks first.

**Follow the browser** turns light or dark as the browser does, and changes with it. It is the default theme from 7.3.0, unless your
administrator picks another one. Hovering a color of the **Color** theme, here or in the header's theme menu, previews the app in that
color, and the previous theme comes back when the pointer leaves the palette; nothing changes until a click.

---

## Desktop notifications

From 7.3.0 the **Notifications** tab turns on desktop notifications in this browser, for users whose role sets `showJobs`.

The browser asks for its permission the first time. When it blocks notifications for the site, the switch stays off and says how to
allow them, and a site on plain `http` cannot show them at all. Once on, a notification comes:

| When | It says | A click on it |
|---|---|---|
| A job you launched ends | The form and its outcome, such as *Patch Linux servers: Succeeded*, with the job number and duration | Brings the tab to the front on that job |
| A job waits for your approval | The form, the job number and who launched it, with **Approve** and **Reject** buttons | Opens the jobs waiting for approval |

The **Approve** and **Reject** buttons show in Chrome and Edge; Firefox and Safari show the notification without them, and so does a
site with a self-signed certificate, as the buttons need a service worker. Notifications come only while an AnsibleForms tab is open,
even in the background: nothing is sent once every tab is closed. Each one shows once, however many tabs are open, and the steps of a
multistep job and the job you are looking at stay quiet.

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
