---
layout: default
title: Logs
parent: Running in production
nav_order: 3
---

# Logs
{: .no_toc }

Log files, syslog, the audit trail, and how long jobs and audit entries are kept
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Log files

AnsibleForms writes two daily-rotated logs to [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), compresses older days and keeps 30 days:

* `ansibleforms.<date>.log` : everything at [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) and above
* `ansibleforms.errors.<date>.log` : errors only

The console, read with `docker logs` or `kubectl logs`, has its own level,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Both default to `notice`, which is right for
production; use `info` or `debug` only while troubleshooting, and leave
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) off. The levels can be changed on
the settings pages without a restart, and the **Server log** page shows the log to users with the `showLogs` option.

---

## Syslog

Set [`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) to also send the log to a syslog server or SIEM.
The other settings default to UDP port 514 and the BSD format:

```bash
LOG_SYSLOG_HOST=syslog.example.com
LOG_SYSLOG_PORT=514
LOG_SYSLOG_PROTOCOL=tcp4
LOG_SYSLOG_TYPE=5424
LOG_SYSLOG_LEVEL=notice
```

[`LOG_SYSLOG_LEVEL`](../customization/logging.html#env_LOG_SYSLOG_LEVEL) defaults to `debug`, unlike the other two
levels, so set it explicitly. All options are on the [Logging](../customization/logging.html) page.

---

## Audit trail

The **Audit log** page (under the administration menu) records who changed what, which the log files do not answer well.
It records:

* every change made through the API (`POST`, `PUT`, `PATCH`, `DELETE`), including attempts refused with 401 or 403
* sign-ins, with the username that was tried
* events of the application itself, such as nightly backups, removed backups, pruned jobs and config seed applies

The IP address recorded is the one AnsibleForms sees, which is the proxy's when it runs behind one.

---

## Retention

Two daily tasks keep the database from growing without limit:

| Variable | Default | Runs at | Removes |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Audit entries older than this |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (keep all) | 2:30 | Finished jobs older than this, with their output |

`0` keeps everything for both. Job output is usually the fastest growing table: the **Status** page reports its size
and warns when it passes 1 GB with no retention set. Running jobs and jobs awaiting approval are never removed.
Decide on a job retention that matches your audit requirements, and keep the audit trail at least as long.
