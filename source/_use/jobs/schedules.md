---
layout: default
title: Schedules
parent: Jobs
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
---

# Schedules
{: .no_toc }

Run a form later or on a cron schedule, and manage every schedule
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The form actions

A form can do more than run right away: the dropdown next to its **Submit** button holds three more actions.

| Action | What it does | Role option |
|---|---|---|
| **Schedule (Recurring)** | Creates a schedule that runs the form on a cron expression | `allowScheduledJobs` |
| **Run Later (One-time)** | Creates a schedule that runs the form once, at a date and time you pick | `allowPlannedJobs` (and `allowScheduledJobs`, see below) |
| **Store** | Saves the field values, to load them into the form again later | `allowStoredJobs` |

An action whose role option is off is not shown. The form is validated before any of them, as it is for **Submit**. Both
schedule actions create an entry on the **Schedules** page; **Store** creates an entry on the **Stored Jobs** page. Both
pages are in the **Planned** section of the sidebar on the [Jobs](./) page. The role options are described in
[Role options](../config/roles.html#role-options).

{: .warning }
> Treat `allowScheduledJobs` as an admin-level option. Schedules are not owned by the user who created them: every user with
> the option sees and can change all schedules. A schedule also runs with admin rights, for any form, whatever the creator's
> own access. Grant it only to roles you would trust as admins.

{: .note }
> **Run Later (One-time)** is shown to users with `allowPlannedJobs`, but it saves a schedule, and the server only accepts
> that from users who also have `allowScheduledJobs`. Without it, the action fails with "You do not have permission to manage
> scheduled jobs".

---

## Schedule a form

Fill in the form, then open the dropdown next to **Submit** and choose one of the schedule actions.

- **Schedule (Recurring)** opens **Create Schedule**: enter a **Name** and a **Cron Expression** (the default, `0 0 * * *`,
  runs daily at midnight), then select **Create Schedule**.
- **Run Later (One-time)** opens **Run Later**: enter a **Name** and pick the **Run At** date and time, then select
  **Schedule Job**.

The name must be unique across all schedules. The schedule keeps the form's name and a copy of the extravars the form produced
at that moment, written as YAML; every run uses that copy, so edit it on the **Schedules** page to change what the job gets.

![Schedules](../assets/screenshots/schedules.jpg)

---

## The Schedules page

The **Schedules** page lists every schedule, with its **Status**, **State** and **Last Run**, and needs `allowScheduledJobs`.

| Action | What it does |
|---|---|
| **Edit Schedule** | Changes the name, the type, the cron expression or run time, the form and the extra vars |
| **Delete Schedule** | Removes the schedule; it stops running at once |
| **Run Schedule** | Runs the schedule now, without waiting for its cron expression or run time |
| **Last Output** | Shows what the last run reported, such as the number of the job it started |

A schedule can also be created here from scratch. Pick the **Form**, then either tick **One Time Run** and set
**Run At**, or leave it clear and set a **Cron Schedule**. **Extra vars** is YAML with no form to fill it in, so add the
values the playbook needs yourself, as a dictionary (key: value pairs).

The **Cron Schedule** field is a cron editor: it describes the expression in words, offers presets and previews the next
runs. The server refuses an expression it cannot run, or one that can never occur.

There is no switch to pause a schedule. To stop a recurring schedule without deleting it, clear its cron expression: it stays
on the page, never runs on its own, and **Run Schedule** still runs it on demand.

---

## Cron expressions and time zone

A recurring schedule takes a standard 5-field cron expression: minute, hour, day of month, month and day of week.

| Expression | Runs |
|---|---|
| `*/15 * * * *` | Every 15 minutes |
| `0 2 * * *` | Every day at 02:00 |
| `30 7 * * 1-5` | Monday to Friday at 07:30 |
| `0 0 1 * *` | At midnight on the first day of every month |

More examples, and the cron features the editor does not accept, are in the FAQ under
[Which cron expressions can I use?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Cron schedules run in the server's time zone, set with [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (default `UTC`),
> not in the time zone of your profile or your browser. The cron editor previews the next runs in that same zone.

---

## How a schedule runs

When a schedule is due, it is queued, and the server starts queued schedules one at a time, checking the queue every 10 seconds.

- **Recurring** schedules skip a tick while the previous run is still queued or running, so runs never overlap.
- **One-time** schedules run within a minute of **Run At**, then are deleted, also when started with **Run Schedule**.
- **Status** is `success` when the job was started and `failed` when it could not be. A `success` only says the job was
  launched: open the job to see how it ended.

A scheduled job runs as the built-in user `Schedule Service` (type `schedule`) with the `admin` role. It can run any form,
whatever the access of the person who created the schedule, and `ansibleforms_user` in its extravars describes that user.

The job also gets a `schedule` object (with its `id`, `name` and `form`), so a playbook knows a schedule started it:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## When the form changes

A schedule refers to its form by name and runs it as it is defined at the moment of each run.

- **The form is edited**: the next run uses the new definition (playbook, template, inventory) with the extravars stored in
  the schedule. The form is not rendered, so no field is recalculated; edit the extra vars of the schedule to match.
- **The form is renamed or removed**: the run fails, **Status** becomes `failed` and **Last Output** reads
  `Failed to launch : No such form '<name>'`. Edit the schedule and pick the right form, or delete it.

---

## Scheduled jobs in the job history

Every run of a schedule creates an ordinary job, listed on the [Jobs](./) page with `Schedule Service` as its user.

Because the job does not belong to the person who created the schedule, it is visible only to admins and to users with
`showAllJobLogs`. The **Last Output** of the schedule names the job it started, so you can find it in the list.
