---
layout: default
title: System tasks
parent: Environment Variables
nav_order: 8
---

# System tasks
{: .no_toc }

When the cleanups, the nightly backup and the runner hub's loops run
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Change these to move the [system tasks](../jobs/system-tasks.html) to other times, or to run the runner hub's loops more or less often.

---

## Example

Back up at 1:00 AM, clean up the jobs at 1:30 AM, and dispatch the jobs to the runners every 5 seconds. In the compose project's `.env`:

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

A `_CRON` variable takes a cron of 5 fields (minute, hour, day, month and weekday) in the server's time zone,
[`LOG_TZ`](logging.html#env_LOG_TZ). Each task's **Schedule** tab, under **Jobs > System**, writes its variable and applies it at
once on every node, without a restart. The config seed reload has its own,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), with the config seed's variables.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="system-tasks" %}
