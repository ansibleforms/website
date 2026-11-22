---
layout: default
title: System tasks
parent: Jobs
nav_order: 7
---

# System tasks
{: .no_toc }

The maintenance tasks AnsibleForms runs on its own, and when they run
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: the cleanups, the nightly backup and the other background work of the server, listed under **Jobs** since 7.8.0.

---

## The tasks

The server runs these tasks on its own, each on a cron in the server's time zone, set with [`LOG_TZ`](../customization/logging.html#env_LOG_TZ):

| Task | Runs by default | What it does |
|---|---|---|
| **Abandoned jobs** | Every hour | Ends the jobs that ran a day without output and that no runner took (see [Abandoned jobs](cleanup.html#abandoned-jobs)) |
| **Stopped nodes** | Every minute | Frees the jobs, claims and runners held by AnsibleForms nodes and RTEs that stopped answering |
| **Schedule ends** | Every minute | Turns off or removes the [schedules](schedules.html) that reached their end |
| **Schedule resync** | Every 5 minutes | Reads the schedules and the repository pulls from the database again, in case a change notice was missed |
| **Expired tokens** | Every day at 03:00 | Removes the expired sign-in tokens, token revocations and API tokens |
| **Audit log cleanup** | Every day at 03:30 | Removes the audit entries older than `AUDIT_RETENTION_DAYS` |
| **Job cleanup** | Every day at 02:30 | Removes the finished jobs older than `JOB_RETENTION_DAYS`, with their output |
| **Nightly backup** | Every day at midnight | Backs up the database and removes the oldest nightly backups beyond `NIGHTLY_BACKUP_RETENTION` |
| **Stored jobs cleanup** | Every day at 04:00 | Removes the stored jobs past their expiry date or unused for `STORED_JOB_UNUSED_DAYS`, and forgets the nodes gone for a day |
| **Config seed reload** | Every minute | Applies the [config seed](../seed/reloading.html) again when its file has changed |

The retention settings are described in [Backups and retention](../customization/retention.html), and the backups in
[Backups](../production/backups.html). The **Config seed reload** is off without [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH).

These tasks run on the node that does the background work: the process without `AF_ROLE`, or the `worker` that holds the worker lock
when the app is split over several nodes (see [Scaling](../production/scaling.html#roles)).

---

## The runner hub's loops

The runner hub hands the jobs to the RTEs, and three loops of its own run every few seconds instead of on a cron:

| Loop | Runs by default | What it does |
|---|---|---|
| **Runner dispatch** | Every 2 seconds | Hands the waiting jobs and the cancels to their runners; one launched on another node reaches its runner at the next pass |
| **Runner inbound dial** | Every 10 seconds | Dials the [inbound](../rte/modes.html#inbound) runners this node may hold, again for one that lost its socket |
| **Runner ended jobs prune** | Every 60 seconds | Lets go what this node kept of jobs that ended on another node |

The loops run on every node that runs the web app, so with several app nodes each one has its own. A minute, the smallest step of a
cron, is too coarse for them: each one runs every so many seconds.

---

## The System list

The [Jobs](./) page lists the tasks under **Future**, as **System**, with the number of tasks, for admins (role option `showSettings`).

The list has one row per task and loop, and is read again every minute:

| Column | Shows |
|---|---|
| **Name** | The task's name |
| **Schedule** | When it runs, in words (*Every hour*, *Every 2 seconds*), its cron on hover, or **Off** for a task that does not run |
| **Last Run** | When the last run started, or a dash when it never ran |
| **Next Run** | When it runs next |
| **Status** | How the last run went: `success` or `failed` |

**Columns** also offers **Description**, what each task does. A click on a row opens the task's page. The tasks are the app's own:
they cannot be added or deleted.

---

## A task's page

A task's page has three tabs, with **Run now** and **Save** above them, and a search box that narrows every tab at once.

| Tab | What it shows |
|---|---|
| **Details** | Its **Name** and **Description**, its **Last launch** (the error on hover when it failed), the **Result** of the last run, **Last run**, **Next run**, the **Node** that answered for a loop, and the **Setting it applies** |
| **Schedule** | When it runs: a cron for a task, an **Interval** in seconds for a loop |
| **Runs** | Every run recorded, the latest first |

**Setting it applies** names the variable and its value, such as `JOB_RETENTION_DAYS` 90, with **Change it in Settings** to open
the settings tab that changes it. A task without such a setting shows a dash.

### The Schedule tab
{: .no_toc }

A task's cron is edited in the same editor as a schedule's: presets, the expression in words and the next three runs, in the server's
time zone. It takes 5 fields (minute, hour, day, month and weekday) and must run again. A loop takes a whole number of seconds,
within its bounds, which the line under the field gives.

**Save** writes the value to the managed settings file, as the settings pages do, and applies it at once on every node, without a
restart. A value set in the process environment, or any value with [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
shows read only, with the line *Set by the environment variable* and its name.

### The Runs tab
{: .no_toc }

Each run of a task is a row, with these columns:

| Column | Shows |
|---|---|
| **Launched By** | The user who selected **Run now**, as `admin (local)`, or **Schedule** for a run on its cron |
| **Start Time**, **End Time** and **Duration** | When the run started and ended, and how long it took |
| **Status** | `success` or `failed` |
| **Result** | What the run did, such as *Removed 120 jobs*, or its error |
| **Node** | The node that ran it |

The runs of the last 30 days are kept, up to 1000 per task: for a task that runs every minute, about its last 16 hours.

A loop runs far too often for a row per pass. Its **Runs** tab shows instead, per node:

* a summary of each hour, such as *1,800 passes, 0 failed*, `failed` when a pass of that hour failed;
* a row for each **Run now**, with *Run now: done* or the error;
* a `failed` row when a pass on its timer fails, at most once a minute for the same error.

### Run now
{: .no_toc }

**Run now** runs the task right away, on the node that runs the tasks, and records the run with your name. It is disabled while a run
of the task is going, and for a task that is **Off**. A long run, such as the nightly backup, carries on after the page answers.

A loop's **Run now** runs one pass on the node that serves the page, and is refused where the runner hub does not run. Each **Run now**
is written to the audit log as `system.task.run`.

---

## Changing when a task runs

Each task and loop has an environment variable for its timing, which its **Schedule** tab writes. All of them apply without a restart.

| Variable | Default | Task |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Abandoned jobs |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Stopped nodes |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Schedule ends |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Schedule resync |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Expired tokens |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Audit log cleanup |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Job cleanup |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Nightly backup |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Stored jobs cleanup |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Config seed reload |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (1 to 60) | Runner dispatch |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (2 to 300) | Runner inbound dial |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (10 to 3600) | Runner ended jobs prune |

A value that is not a valid cron, or seconds out of bounds, set by hand in the environment, is passed over for the default.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Before 7.8.0 the config seed was checked every [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS).
That variable is deprecated since 7.8.0, in favour of `CONFIG_SEED_RELOAD_CRON`, and will be removed in 8.0. While
`CONFIG_SEED_RELOAD_CRON` is not set, it is still read as a cron, with a warning in the log at start:

| `CONFIG_SEED_RELOAD_SECONDS` | Reads as |
|---|---|
| `60` | `* * * * *`, every minute |
| A multiple of 60 up to `3600` | Every so many minutes, such as `*/5 * * * *` for `300` (`3600` reads as `0 * * * *`) |
| A number under 60 that divides 60 | Every so many seconds |
| `0` | The reload is off |
| Any other number | The nearest of these, which the log says |

The task's **Schedule** tab shows that cron with the line *From the deprecated CONFIG_SEED_RELOAD_SECONDS; a cron saved here
replaces it.* **Save** writes `CONFIG_SEED_RELOAD_CRON`, which wins over the old variable from then on.
