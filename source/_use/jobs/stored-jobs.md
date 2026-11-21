---
layout: default
title: Stored jobs
parent: Jobs
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
---

# Stored jobs
{: .no_toc }

Keep the data of a form to load it again later
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Stored jobs

Stored jobs keep the values of a form so you can load them again, instead of filling in the same fields every time.

To store, fill in the form, open the dropdown next to **Submit** and choose **Store**. In **Save form data**, enter a
**Name**, an optional **Description** and when it is **Removed** (see [When it is removed](#when-it-is-removed)), then
save. Password and constant fields are never stored. A subform has the same **Store** action next to its **Save** button, and keeps unfinished values without
validating them.

To load, select **Load from store** at the top of the form. **Load saved form** lists your stored jobs for that form, with
their creation and expiry dates; select one to fill in the form with its values. Nothing runs until you submit.

Stored jobs are kept in the AnsibleForms database (table `stored_jobs`), with the form name, your user as
`<type>/<username>` (for example `local/admin`) and the values as JSON. A name must be unique per user and form; storing a
second one with the same name fails with "A saved form with this name already exists".

---

## Manage stored jobs

The **Stored jobs** page lists stored jobs with their form, user, creation and expiry dates, and needs `allowStoredJobs`.

From 7.6.0 `allowStoredJobs` alone opens **Jobs > Stored** and **Add stored job**, which before also took `showSettings` or
`allowScheduledJobs`. Its **Form** list offers the forms your roles open; users with `showSettings` or `allowScheduledJobs` get every form.

From 7.7.0 the list has a sortable **Last used** column, so the stored jobs still in use stand apart from the abandoned ones.

- **Edit** opens the stored job's own page: its **Details** (name, description, form, user, when it was created and last
  used, and when it is removed), its **Values**, the stored field values as YAML, which can be changed and saved there,
  and its **Runs**.
- **Open in form** opens its form with the stored values filled in; nothing runs until you submit.
- **Delete** removes it. You can delete your own stored jobs; users with `showSettings` can delete any.

---

## Last used and runs

From 7.7.0 a stored job records when it was last used, and the jobs launched from it, so you can tell which ones are still in use.

These launches count as a use of a stored job:

| Launch | When it counts |
|---|---|
| The form opened from it (**Open in form**), or filled with **Load** | When the job is launched |
| **Run later** from that form | When the planned run fires, not when it is planned |
| A **relaunch** of a job launched from it | When the relaunch starts, with the same or changed values |
| The MCP `launch_job` or `plan_job` with it | As above |

The runs of a schedule never count, even of one made from a stored job: a schedule keeps its own copy of the values.
A launch only counts when the user may see the stored job; one deleted or hidden since is skipped and the job still runs.

The job page names the stored job a job was launched from, with a link, when you may see it. The stored job page's
**Runs** tab lists the jobs launched from it that you may see, with their status, start, end and duration.

---

## When it is removed

Each stored job says when it is removed: never, on a date, or once it has gone unused for some days.

| Choice | What it does |
|---|---|
| **Never** | Keeps it until someone deletes it. Not offered while `STORED_JOB_UNUSED_DAYS` is set |
| **On a date** | Removes it on that date |
| **When unused for N days** | Removes it once no job was launched from it for that many days |

An admin can set [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS)
(Settings > General > Retention). It then removes every stored job left unused for that many days, a stored job's own
days can only be fewer, the Store dialog starts at them, and one removed on a date is still removed once unused that
long. The days count from the last use or, for a stored job never used, from when it was stored. Its default, 0, never
removes one for being unused.

Stored jobs are removed every day at 04:00 (in `LOG_TZ`), whichever of their date and their days comes first.
