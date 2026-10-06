---
layout: default
title: Backups and logs
parent: Running in production
nav_order: 4
---

# Backups and logs
{: .no_toc }

Nightly backups, restores, what else to keep, log files and the audit trail
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Nightly backups

AnsibleForms backs itself up every night at midnight, in the timezone of [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(UTC by default). These settings control it:

| Variable | Default | Meaning |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | Where backups are written, one timestamped folder each |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/paths.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | How many nightly backups are kept, `0` keeps them all |
| [`MYSQLDUMP_COMMAND`](../customization/paths.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | The command that dumps the database |
| [`MYSQL_COMMAND`](../customization/paths.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | The command that replays a dump on restore |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/paths.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | How long the dump and the restore may run |

Users with the `allowBackupOps` role option can also take a backup at any time on the **Backups** page. Only nightly
backups are removed by the retention, and only backups with a usable dump count towards it, so a series of failed
nights never pushes out the last good one.

The dump and restore commands can be wrappers, for example `docker exec <container> mysqldump`, as long as their first
word is a program that exists where AnsibleForms runs.

---

## What a backup contains

Each backup is a folder under `BACKUP_PATH`, named after its UTC timestamp (`YYYYMMDDHHmmss`), holding:

| File | Content |
|------|---------|
| `ansibleforms.sql` | The dump of the `AnsibleForms` database: users, groups, credentials, jobs, settings, the audit trail |
| `config.yaml` | The file at [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | The folder at [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | The environment file the settings pages write, without `ENCRYPTION_SECRET` and `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | The description of the backup |

A backup whose dump fails is removed again and logged as an error. The **Status** page warns when there is no backup,
when the newest one is more than two days old, or when it has no usable dump, and it checks that the dump tool exists.

[`OLD_BACKUP_DAYS`](../customization/paths.html#env_OLD_BACKUP_DAYS) is a different thing: it is how long the
configuration restore points written by the designer, under `FORMS_BACKUP_PATH`, are kept (60 days by default).

---

## Restoring a backup

Restore from the **Backups** page, see [Administration](../gui/administration.html#restore). Keep
**Create a new backup before restoring (recommended)** ticked, so you can return to the current state. A restore:

* replays `ansibleforms.sql`, which replaces the whole database
* copies `config.yaml` and the `forms/` folder back in place
* does **not** restore `managed.env`, because it describes the host the backup came from. The **Restore environment**
  button puts it back on request, keeps the current file as `.env.bak`, and needs a restart.

A backup without a usable dump is refused. If a restore is cut short, for example by the timeout, the database is
partly replayed: fix the cause and run the restore again.

On a new host, set the same `ENCRYPTION_SECRET` before you restore, or the stored credentials cannot be decrypted.

---

## What else to back up

The nightly backup covers the database, the configuration and the forms, but nothing else in the persistent folder:

* **`ENCRYPTION_SECRET` and `ACCESS_TOKEN_SECRET`** : never in a backup, by design. Keep them in your secret manager;
  without the encryption secret a database dump is useless for credentials.
* **the backups themselves** : they live on the same volume as the instance. Copy `BACKUP_PATH` to another host.
* **the rest of the persistent folder** : playbooks, uploads, vars files, cloned repositories, certificates and logs.
  With the docker-compose project, back up the whole `data/` folder, which also holds the SSH key, the custom
  functions and the Ansible roles and collections.

Content that comes from git (repositories, forms in a repository) can be cloned again, so its backup matters less.

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
| [`AUDIT_RETENTION_DAYS`](../customization/paths.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Audit entries older than this |
| [`JOB_RETENTION_DAYS`](../customization/paths.html#env_JOB_RETENTION_DAYS) | `0` (keep all) | 2:30 | Finished jobs older than this, with their output |

`0` keeps everything for both. Job output is usually the fastest growing table: the **Status** page reports its size
and warns when it passes 1 GB with no retention set. Running jobs and jobs awaiting approval are never removed.
Decide on a job retention that matches your audit requirements, and keep the audit trail at least as long.
