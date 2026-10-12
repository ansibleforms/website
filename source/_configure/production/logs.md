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

Syslog servers are managed under **Settings > Connections > Syslog**, so a syslog server or SIEM gets the log as it is written.
You can add several servers, and each one has its own settings:

| Setting | What it does |
|---------|--------------|
| Enabled | Only enabled servers get anything, so a server can be paused without deleting it |
| Protocol | `udp4` (default), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` or `unix-connect` |
| Host and port | The server to send to, port `514` by default; a `unix` protocol takes a socket path instead |
| Receives | The server log, the audit entries, or both (the default for a new server) |
| Level | The lowest level of the server log it gets, `info` by default; audit entries are always sent |
| Type | `BSD` (RFC 3164, the default) or `RFC 5424` |

A change applies on every node without a restart, and the server's page has a button that sends it a test message.
A server that cannot be reached never stops the application: the error is written to the console.

The `LOG_SYSLOG_*` variables of earlier versions are deprecated since 7. The first start that finds
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) set imports them once as the server `syslog`,
receiving the server log as before, and ignores them from then on. Remove them from the environment after that first
start, and manage the server on the settings page.

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
