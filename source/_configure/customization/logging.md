---
layout: default
title: Logging
parent: Environment Variables
nav_order: 7
---

# Logging
{: .no_toc }

Log levels, files, syslog and console colours
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Change these to adjust how much is logged, where the log files go, or show timestamps in your own timezone.

---

## Example

Log more in the files than on the console, and show log and job timestamps in Amsterdam time.
In the compose project's `.env`:

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Syslog servers are no longer configured here: add them under **Settings > Connections > Syslog**, see [Logs](../production/logs.html#syslog).
The `LOG_SYSLOG_*` variables below are deprecated since 7. The first start that finds `LOG_SYSLOG_HOST` set imports them
once as the syslog server `syslog`, which receives the server log, and ignores them from then on.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="logging" %}
