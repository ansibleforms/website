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

Change these to send the log to a central server, adjust how much is logged, or show timestamps in your own timezone.

---

## Example

Send notices and above to a central syslog server over TCP, with log and job timestamps in Amsterdam time.
In the compose project's `.env`:

```bash
LOG_SYSLOG_HOST=syslog.example.com
LOG_SYSLOG_PORT=514
LOG_SYSLOG_PROTOCOL=tcp4
LOG_SYSLOG_TYPE=RFC5424
LOG_SYSLOG_LEVEL=notice
LOG_SYSLOG_SOURCE=forms01.example.com
LOG_TZ=Europe/Amsterdam
```

Without `LOG_SYSLOG_HOST`, nothing is sent to syslog. The log files under `LOG_PATH` are written as before.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="logging" %}
