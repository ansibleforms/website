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
(`%PERSISTENT_FOLDER%/logs`), compresses older days and keeps them for [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS)
(30 by default, `0` keeps every file; a change on the settings page applies at once):

* `ansibleforms.<date>.log` : everything at [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) and above
* `ansibleforms.errors.<date>.log` : errors only

The console, read with `docker logs` or `kubectl logs`, has its own level,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Both default to `notice`, which is right for
production; use `info` or `debug` only while troubleshooting, and leave
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) off. The levels can be changed on
the settings pages without a restart, and the **Server log** page shows the log to users with the `showLogs` option.

---

## JSON lines

For a log collector such as Loki, ELK or Splunk, set [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) to `json`. Every
line, on the console and in the files, is then one JSON object instead of `<time> <level>: <message>`:

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Field | Content |
|-------|---------|
| `time` | The time, in ISO 8601 UTC |
| `level` | The log level |
| `message` | The message |
| `requestId` | The request the line belongs to, when it was written while serving one |
| `role` | The role of the process, [`AF_ROLE`](scaling.html), or `all` when it is not set |
| `host` | The host name of the machine or container the process runs in |

Every request gets an id: the `X-Request-Id` header a reverse proxy sent, or a new one. It is returned in the response's
`X-Request-Id` header and carried by every line written while the request is served (as `[req <id>]` in text lines),
so a request can be followed through the log and matched with the proxy's. A change on the settings page applies at once.

---

## Syslog

Syslog servers are managed under **Settings > Connections > Syslog**, so a syslog server or SIEM gets the log as it is written.
You can add several servers, and each one has its own settings:

| Setting | What it does |
|---------|--------------|
| Enabled | Only enabled servers get anything, so a server can be paused without deleting it; **Enable** and **Disable** in its row menu switch it too |
| Protocol | `udp4` (default), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` or `unix-connect` |
| Host and port | The server to send to, port `514` by default; a `unix` protocol takes a socket path instead |
| Receives | The server log, the audit entries, or both (the default for a new server) |
| Level | The lowest level of the server log it gets, `info` by default; audit entries are always sent |
| Type | `BSD` (RFC 3164, the default) or `RFC 5424` |

A change applies on every node without a restart, and the server's page has a button that sends it a test message.
A server that cannot be reached never stops the application: the error is written to the console.

From 7.3.0 the syslog servers need the full settings rights, the [`showSettings`](../config/roles.html#role-options) role option:
access to the connections settings alone is not enough, as a syslog server receives the server log and the audit entries.

The `LOG_SYSLOG_*` variables of earlier versions are deprecated since 7. The first start that finds
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) set imports them once as the server `syslog`,
receiving the server log as before, and ignores them from then on. Remove them from the environment after that first
start, and manage the server on the settings page.

---

## Audit trail

The **Audit log** page (under **Settings > Logs**) records who changed what, which the log files do not answer well.
It records:

* every change made through the API (`POST`, `PUT`, `PATCH`, `DELETE`), including attempts refused with 401 or 403
* sign-ins, with the username that was tried
* events of the application itself, such as nightly backups, removed backups, pruned jobs and config seed applies

Each entry has its time, the actor (a user, or the application itself for its own tasks), the client IP address,
the action, its target and its outcome: `success`, `failure` or `denied`. The page filters on the actor, the action and
the outcome, and users with the `showSettings` role option can open it.

The IP address is the one AnsibleForms sees, which is the proxy's when it runs behind one. Set
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) to the number or the addresses of your proxies, and AnsibleForms
records the client address the proxy reports in `X-Forwarded-For` instead; see [Reverse proxy](reverse-proxy.html).

To keep the audit trail outside the instance, for a SIEM, add a syslog server that receives the audit entries (see
[Syslog](#syslog)). Each entry is sent as it happens, as one line `audit {...}` with the entry as JSON, whatever the
server's level. The syslog copy is not removed by the retention below, nor replaced by a restore of the database.

---

## Retention

Two daily tasks with a setting keep the database from growing without limit:

| Variable | Default | Runs at | Removes |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Audit entries older than this |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (keep all) | 2:30 | Finished jobs older than this, with their output |

`0` keeps everything for both. Two more daily tasks have no setting: at 3:00 the stored refresh tokens older than 30 days and
the expired token revocations are removed, and at 4:00 the [stored jobs](../jobs/stored-jobs.html) whose expiry has passed.
The times are in the timezone of [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), and the worker runs them.

Job output is usually the fastest growing table: the **Status** page reports its size
and warns when it passes 1 GB with no retention set. Running jobs and jobs awaiting approval are never removed.
Decide on a job retention that matches your audit requirements, and keep the audit trail at least as long.
