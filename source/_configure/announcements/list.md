---
layout: default
title: List
parent: Announcements
nav_order: 2
---

# List
{: .no_toc }

The announcements that have not ended, their columns, and an announcement's page
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The list

**Settings > Appearance > Announcements** lists every announcement that has not ended, with these columns:

| Column | Meaning |
|---|---|
| **Enabled** | Whether it shows under the header from its start until its end (from 7.3.0) |
| **Message** | The text under the header |
| **Type** | Info, Warning or Danger |
| **Start date** | When it starts to show; `–` when it shows at once |
| **End date** | When it ends; `–` when it shows until deleted |
| **Created by** | Who added it |

A click on a row, or **Edit** in its row menu, opens the announcement's page. The menu also has **Enable** or **Disable**, and **Delete**.

Once its end date passes, an announcement is deleted: the list only keeps the ones to come and the ones showing.

---

## An announcement's page

From 7.3.0 each announcement opens on its own page, at `/settings/announcements/<id>`, with one tab, **Details**.

It holds the message, the type, the start and end dates and the **Enabled** switch, which is saved at once; the other fields are saved
with **Save**, and **Delete** removes the announcement. The page's title names it by the first characters of its message.
