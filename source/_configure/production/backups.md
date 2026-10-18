---
layout: default
title: Backups
parent: Running in production
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
---

# Backups
{: .no_toc }

Nightly backups, what they contain, restores, and what else to keep
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
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | How many nightly backups are kept, `0` keeps them all |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | The command that dumps the database |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | The command that replays a dump on restore |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | How long the dump and the restore may run |

Users with the `allowBackupOps` role option can also take a backup at any time on the **Backups** page. Only nightly
backups are removed by the retention, and only backups with a usable dump count towards it, so a series of failed
nights never pushes out the last good one.

The commands may be wrappers such as `docker exec <container> mysqldump`, if their first word exists locally. From 7.3.0 they run
without a shell: quotes and `$NAME` from the command's environment work, but `;`, `|`, `&&`, `>` and `<` are refused.

---

## Database rights

The dump runs as [`DB_USER`](../customization/server.html#env_DB_USER), and needs no more than the rights the application itself needs:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

The dump is taken with `--no-tablespaces`, so the server-wide `PROCESS` right is not needed, and it skips the tables
that describe the running processes (`nodes`, `cache_epochs`, `designer_lock`). The restore replays it as the same user.
The **Status** page shows a warning on its **Database user** check when the user has rights on every database, as `root` has.

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

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) instead keeps the designer's restore points (60 days by default).

---

## Restoring a backup

Restore from the [**Backups** page](../gui/administration.html#restore), with **Create a new backup before restoring** ticked. A restore:

* replays `ansibleforms.sql`, which replaces the whole database; from 7.3.0 a backup of an older release is then upgraded
  again, as at the start of a new release, and a patch that fails is reported
* copies `config.yaml` back, and replaces the `forms/` folder with the backup's: from 7.3.0 forms that are not in the backup are
  removed instead of kept, the folder's links and mode stay, and a failed copy rolls the folder back
* does **not** restore `managed.env`, because it describes the host the backup came from. The **Restore environment**
  button puts it back on request, keeps the current file as `.env.bak`, and needs a restart.

A backup without a usable dump is refused; after an interrupted restore, fix the cause and restore again.

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
