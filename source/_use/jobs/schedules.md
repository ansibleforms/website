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

Run a form later, on a cron or a rrule, and manage every schedule
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The form actions

A form can do more than run right away: the dropdown next to its **Submit** button holds three more actions.

| Action | What it does | Role option |
|---|---|---|
| **Schedule (recurring)** | Creates a schedule that runs the form on a cron expression | `allowScheduledJobs` |
| **Run later (one-time)** | Creates a schedule that runs the form once, at a date and time you pick | `allowPlannedJobs` |
| **Store** | Saves the field values, to load them into the form again later | `allowStoredJobs` |

An action whose role option is off is not shown. The form is validated before any of them, as it is for **Submit**. Both
schedule actions create an entry under **Jobs > Scheduled**; **Store** creates an entry on the **Stored jobs** page. The
sidebar of the [Jobs](./) page opens them under **Future**, as **Scheduled** and **Stored**. The role options are described
in [Role options](../config/roles.html#role-options).

{: .warning }
> Treat `allowScheduledJobs` as an admin-level option. Its schedules are not owned by the user who created them: every user
> with the option sees and can change all schedules. Such a schedule also runs with admin rights, for any form, whatever the
> creator's own access. Grant it only to roles you would trust as admins.

{: .note }
> **Run later (one-time)** needs only `allowPlannedJobs`. For a user without `allowScheduledJobs`, it plans a run **as that
> user**: the server checks that the user may run the form, and the job runs as them, owned by them, when its time comes
> (see [Planned runs](#planned-runs)).

---

## Schedule a form

Fill in the form, then open the dropdown next to **Submit** and choose one of the schedule actions.

- **Schedule (recurring)** opens **Create schedule**: enter a **Name** and a **Cron expression** (the default, `0 0 * * *`,
  runs daily at midnight), then select **Create schedule**.
- **Run later (one-time)** opens **Run later**: enter a **Name** and pick the **Run at** date and time, then select
  **Schedule job**.

The name must be unique across all schedules. The schedule keeps the form's name and a copy of the extravars the form produced
at that moment, written as YAML; every run uses that copy, so edit it on the schedule's page to change what the job gets. To
time it with a rrule instead, or give it an end, open its page and change its **Schedule** tab.

![Schedules](../assets/screenshots/schedules.jpg)

---

## The schedules list

**Jobs > Scheduled** lists every schedule and needs `allowScheduledJobs`; a row opens the schedule's own page.

| Column | Shows |
|---|---|
| **Enabled** | Whether the schedule runs on its own timing |
| **Name** and **Form** | The schedule, and the form it runs |
| **Schedule** | Its timing in plain language, such as *At 02:00 AM*; hover it to see the cron or the rule itself |
| **Last Run** | When it last ran |
| **Next Run** | When it runs next, a dash when it has no run ahead |
| **Status** | Its last launch: whether it started a job, or **Starting…** while it launches one |

The **Schedule** column says a one-time schedule as **One time run**. A rrule that plain language cannot describe is
shown as it is. Each row's menu offers:

| Action | What it does |
|---|---|
| **Edit** | Opens the schedule's page |
| **Run now** | Runs the schedule now, without waiting for its timing |
| **Enable** or **Disable** | Turns the schedule on or off, whichever applies, as its **Enabled** column shows |
| **Delete** | Removes the schedule; it stops running at once |

**New schedule** creates one from scratch, in three steps: **Details** (its **Name**, **Description** and **Form**),
**Schedule** (its timing and its end) and **Extra vars**. **Extra vars** is YAML with no form to fill it in, so add the
values the playbook needs yourself, as a dictionary (key: value pairs).

---

## A schedule's page

A schedule's page holds the steps of its dialog as tabs, with **Run now**, **Delete** and **Save** at the top right.

| Tab | What it holds |
|---|---|
| **Details** | Its source, **Name**, **Description**, **Form**, then **Last launch**, **Started job**, **Last run**, **Next run** and **Enabled** |
| **Schedule** | How it is timed (see [Timing a schedule](#timing-a-schedule)) and how it ends (see [The end of a schedule](#the-end-of-a-schedule)) |
| **Extra vars** | The YAML the job gets; for a schedule kept in git, the prompts of its file too |
| **Runs** | The jobs it started, the latest first; a row opens the job |

**Last launch** says how its last launch went, as a status: a failed one says why when hovered. **Started job** links to
the job it started, so you can open it and see how it ended. The **Runs** tab lists the jobs you may see, with who they ran as,
their start, end, duration and status; its count is in the tab's title.

The **Enabled** switch pauses a schedule without deleting it, and is saved with **Save**, as every field of the page. A
schedule turned off stays listed with its settings, but does not run on its own: a recurring one skips its runs, and a
one-time one waits past its moment until it is turned on again. **Run now** still runs it on demand. A new schedule is on.

---

## Timing a schedule

A schedule is timed one of three ways, chosen under **Timing** on its **Schedule** tab; the rrule is new in 7.8.0.

| Timing | Runs | See |
|---|---|---|
| **Cron** | Recurring, on a cron expression in the time zone of the server | [Cron expressions and time zone](#cron-expressions-and-time-zone) |
| **Recurrence rule (rrule)** | Recurring, on an iCal rule in its own time zone | [Recurrence rules](#recurrence-rules) |
| **One time run** | Once, at a date and time | [How a schedule runs](#how-a-schedule-runs) |

Under a cron or a rrule, the editor shows the next three runs, and stops them at the schedule's end. Changing the timing
keeps only the one chosen: a schedule switched from a cron to a rrule loses its cron.

---

## Cron expressions and time zone

A recurring schedule can take a standard 5-field cron expression: minute, hour, day of month, month and day of week.

| Expression | Runs |
|---|---|
| `*/15 * * * *` | Every 15 minutes |
| `0 2 * * *` | Every day at 02:00 |
| `30 7 * * 1-5` | Monday to Friday at 07:30 |
| `0 0 1 * *` | At midnight on the first day of every month |

The cron editor describes the expression in words, offers presets and previews the next runs. The server refuses an
expression it cannot run, or one that can never occur. More examples, and the cron features the editor does not accept, are
in the FAQ under [Which cron expressions can I use?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Cron schedules run in the server's time zone, set with [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (default `UTC`),
> not in the time zone of your profile or your browser. The cron editor previews the next runs in that same zone.

---

## Recurrence rules

Since 7.8.0 a recurring schedule can take an iCal recurrence rule (rrule) instead, which runs in a time zone of its own.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

The first runs every day at 02:00 in Brussels, the second every Monday at 06:00 UTC, the third on the last weekday of
every month at 07:30 in New York. A rule is one line, its parts separated by spaces:

| Part | What it says |
|---|---|
| `DTSTART` | The first run, with a `TZID` (an IANA zone such as `Europe/Brussels`, or an offset such as `UTC+5` or `GMT-3`), or in UTC ending in `Z` |
| `RRULE` | When it repeats: `FREQ` with an `INTERVAL` of at least 1, and `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … as needed; one or more |
| `EXRULE` | Optional: a rule of runs to skip |

The server refuses a rule it cannot run, and says why:

- no `DTSTART`, more than one, or one without a time zone, and `EXDATE` or `RDATE`;
- a rule without `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` with a number (`5MO`), or `COUNT` together with `UNTIL`;
- `COUNT` above 999, a `BYxxx` number out of its range (`BYHOUR` 0 to 23, `BYSETPOS` 1 to 366 or -366 to -1 …), a `WKST`
  that is no weekday, a `DTSTART` or `UNTIL` that is no real date (`20300230`), or a part given twice in a rule;
- a rule that never fires: no run in the 50 years after its `DTSTART`, such as `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` from
  midnight, which only meets even hours.

The editor is a text box: a new rrule starts as every day at midnight in your browser's time zone. It says at once why a rule
would be refused, else shows its next three runs in the rule's own time zone, or **This rrule has no run ahead.** when its
`UNTIL` or `COUNT` is past. A time a daylight saving change skips runs when the clock reaches it (02:30 runs at 03:30 the
night the clock goes from 02:00 to 03:00), as a cron does; a time the clock shows twice runs once, at the first.

---

## The end of a schedule

Since 7.8.0 a schedule timed by a cron or a rrule may end; under **Ends** on its **Schedule** tab, choose one option.

| Ends | The schedule ends |
|---|---|
| **Never** | Never: the default, and every schedule from before 7.8.0 |
| **On a date** | At the date and time picked: no run after it |
| **After** … **runs** | Once it has started that many jobs in all, the ones its **Runs** tab lists; the field says how many so far |

**When it ends**, it is turned off (**Disable it**, the default) or deleted (**Remove it**). The **Schedule ends**
system task applies the ends every minute, and a schedule that reaches its number of runs ends right after its last one. A
rrule's own `UNTIL` or `COUNT` still applies; the end comes on top of it.

A one-time schedule has no end: it ends with its run. Its **Remove after it runs** switch, on by default, deletes it after
its run; turned off, the schedule is disabled after its run and kept with its outcome.

---

## How a schedule runs

When a schedule is due, it is queued, and the server starts queued schedules one at a time, checking the queue every 10 seconds.

- **Recurring** schedules skip a run while the previous run is still queued or running, so runs never overlap.
- **One-time** schedules run within a minute of their moment, then are deleted (or kept, turned off, when **Remove after
  it runs** is off), also when started with **Run now**.
- **Status** is `success` when the job was started and `failed` when it could not be. A `success` only says the job was
  launched: open the job to see how it ended.

A schedule created with `allowScheduledJobs` runs as the built-in user `Schedule Service` (type `schedule`) with the
`admin` role. It can run any form, whatever the access of the person who created the schedule, and `ansibleforms_user` in
its extravars describes that user. A [planned run](#planned-runs) runs as the user who planned it instead.

The job also gets a `schedule` object, so a playbook knows a schedule started it:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

Its `one_time_run` is the moment of a one-time schedule's run, `null` for a recurring one. It carries the schedule's other
settings too, such as `enabled` and `repository`, and `run_at`: the same moment under its name from before 7.8.0 (deprecated, removed in 8).

---

## Planned runs

**Run later (one-time)** by a user without `allowScheduledJobs` creates a planned run: a one-time schedule tied to that user.

- **When it is planned**, the server checks that the user may run the form (its `roles`), and verbose mode needs
  `allowVerboseMode`. A planned run is always one-time; a cron expression or a rrule is refused.
- **Under launch validation `enforce`**, the field values are checked when it is planned, so a run that would be refused is
  refused while the user is still looking.
- **When it runs**, the job runs as that user, owned by them, through the same checks as a launch from the browser: the
  form's roles as they are then, the reserved extravars stripped, and launch validation. `ansibleforms_user` describes them.

The planner does not see **Jobs > Scheduled**, which needs `allowScheduledJobs`; the job appears in their own job history. A
planned run is always removed after its run.

---

## When the form changes

A schedule refers to its form by name and runs it as it is defined at the moment of each run.

- **The form is edited**: the next run uses the new definition (playbook, template, inventory) with the extravars stored in
  the schedule. The form is not rendered, so no field is recalculated; edit the extra vars of the schedule to match.
- **The form is renamed or removed**: the run fails, **Status** becomes `failed` and **Last launch**, hovered, says
  `Failed to launch : No such form '<name>'`. Edit the schedule and pick the right form, or delete it.

---

## Scheduled jobs in the job history

Every run of a schedule creates an ordinary job, listed on the [Jobs](./) page with `Schedule Service` as its user, or,
for a planned run, with the user who planned it.

A `Schedule Service` job does not belong to the person who created the schedule, so it is visible only to admins and to
users with `showAllJobLogs`; a planned run's job is visible to its user too. The schedule's **Runs** tab lists the jobs it
started, and its **Started job** links to the last one.

---

## Schedules in a git repository

Since 7.8.0 schedules can also be kept in a git repository, as entries of a `controller_schedules:` list in its YAML files.

One repository at most has the **Schedules** usage: its entries are read into **Jobs > Scheduled** on every pull, timed by a
`cron`, a `rrule` or a `one_time_run`, and a schedule made or changed in the app is written back to its file, waiting for
the repository's push. Such a schedule shows its file on its page, and its end only ever turns it off. See
[Git repositories](../repositories/).

---

## In the API

Since 7.8.0 a schedule of the API has three timing fields, exactly one of them set: `cron`, `rrule` or `one_time_run`.

| Field | Holds |
|---|---|
| `cron` | A cron expression |
| `rrule` | A recurrence rule, on one line |
| `one_time_run` | The moment of its one run, an ISO 8601 time with its offset or `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | Its end: `never`, `date` or `count`, its date, its number of runs, and `disable` or `remove` |
| `remove_after_run` | A one-time schedule: `false` keeps it, turned off, after its run |

{: .warning }
> The pair the API took before 7.8.0, `one_time_run: true` with `run_at`, is deprecated since 7.8.0 and removed in 8. It is
> still read as `one_time_run` at that moment, with a warning in the server log; `one_time_run: false` with a cron is read as
> that cron.
