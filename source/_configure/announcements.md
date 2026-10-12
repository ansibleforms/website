---
layout: default
title: Announcements
nav_order: 8.5
---

# Announcements
{: .no_toc }

Messages under the header for everyone, such as a maintenance window, each from its start to its end
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: tell every user about a maintenance window or an incident, under **Settings > Appearance > Announcements**.

The page needs the `showSettings` role option. Its two tabs, **General** and **List**, are described below.

---

## Where they show

Announcements show as a line under the header of every page, for every signed-in user, each in the colour of its type.

Several can show at once, the latest first. The sign-in page and a form embedded in another site show none.

Each one has a close button. A closed announcement stays closed in that browser tab until the tab is closed, or
until its message or its end date changes. A saved announcement reaches every open browser at once; one that
reaches its start or its end date shows or hides there within a minute.

---

## General

**General** has the **Show announcements** switch, which turns all of them on or off at once.

Switched off, none shows under the header, and the list keeps them as they are. **Add announcement** opens the wizard below.

---

## List

**List** shows every announcement that has not ended, with these columns:

| Column | Meaning |
|---|---|
| **Message** | The text under the header |
| **Type** | Info, Warning or Danger |
| **Start date** | When it starts to show; `–` when it shows at once |
| **End date** | When it ends; `–` when it shows until deleted |
| **Status** | **Scheduled** before its start, **Showing** from then on |
| **Created by** | Who added it |

A row's menu has **Edit announcement** and **Delete announcement**.

Once its end date passes, an announcement is deleted: the list only keeps the ones to come and the ones showing.

---

## Adding one

**Add announcement** opens a wizard in two steps. **Message** asks what it says:

| Field | Meaning |
|---|---|
| **Message** | The text, at most 500 characters. Required. |
| **Type** | Its colour and icon: blue for Info (the default), amber for Warning, red for Danger |

**When** asks when it shows:

| Field | Meaning |
|---|---|
| **Start date** | It shows from this moment. Leave it empty to show it at once. |
| **End date** | At this moment it hides and is deleted. Leave it empty to keep it until you delete it. |

The end date must come after the start date, and lie in the future.
