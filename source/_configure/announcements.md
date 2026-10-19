---
layout: default
title: Announcements
nav_order: 1
has_children: true
has_toc: false
permalink: /announcements.html
---

# Announcements
{: .no_toc }

Messages under the header for everyone, such as a maintenance window, each from its start to its end
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: tell every user about a maintenance window or an incident, under **Settings > Appearance > Announcements**.

The page needs the `showSettings` or the `showAppearanceSettings` role option. From 7.3.0 it is one list, and each announcement
has its own page and Enabled switch.

---

## In this section

| Page | What it covers |
|---|---|
| [General](announcements/general.html) | Each announcement's Enabled switch, which replaced the switch for all of them |
| [List](announcements/list.html) | The announcements that have not ended, their columns, and an announcement's page |
| [Adding one](announcements/adding-one.html) | The two-step wizard: the message, then when it shows |


---

## Where they show

Announcements show as a line under the header of every page, for every signed-in user, each in the colour of its type.

Several enabled ones can show at once, the latest first. The sign-in page and a form embedded in another site show none.

Each one has a close button. A closed announcement stays closed in that browser tab until the tab is closed, or
until its message or its end date changes. A saved announcement reaches every open browser at once; one that
reaches its start or its end date shows or hides there within a minute.

