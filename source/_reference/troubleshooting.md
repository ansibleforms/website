---
layout: default
title: Troubleshooting
nav_order: 2
---

# Troubleshooting
{: .no_toc }

Error messages and symptoms, why they happen and how to fix them
{: .fs-6 .fw-300 }

---

Each problem below is titled with the message or symptom you see, followed by the cause and the fix. Messages are quoted
exactly as AnsibleForms writes them; `<name>` stands for a value that differs per case. Most of them land in the server
log, which you can read under [Server Log](gui/administration.html#server-log) or with `docker logs`.

**Database and startup**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)
* [Schedule is running, skipping, this is not normal](#schedule-is-running-skipping-this-is-not-normal)

**Configuration and forms**

* [Could not load the forms](#could-not-load-the-forms)
* [The base config has a forms section](#the-base-config-has-a-forms-section)
* [A form is missing from the dashboard](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Login**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Azure AD or OIDC authentication failed](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Logged out after a restart or after a day](#logged-out-after-a-restart-or-after-a-day)

**Jobs**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [A job shows the status abandoned](#a-job-shows-the-status-abandoned)
* [The form data is not valid](#the-form-data-is-not-valid)

**Git repositories and backups**

* [A repository clone or pull failed](#a-repository-clone-or-pull-failed)
* [The forms repository is not cloned yet](#the-forms-repository-is-not-cloned-yet)
* [A backup failed](#a-backup-failed)

The [FAQ](faq.html) covers two related problems in depth: a
[lost admin password](faq.html#recovering-a-lost-admin-password) and
[restricting REST helper destinations](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

AnsibleForms does not start, and the log repeats these lines every 5 seconds:

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Why this happens**

At startup, AnsibleForms waits until the database answers a query, and it keeps waiting for as long as it does not.
The `<reason>` is the database driver's own message: a refused or timed-out connection points at the host or the port,
an access-denied message at the user name or the password.

**How to fix it**

Check [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) and [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
From inside a container, `localhost` is the container itself, not the host that runs MySQL. Make sure that MySQL listens
on a network address and that the user may connect from the AnsibleForms host. AnsibleForms carries on by itself as soon
as the database answers; no restart is needed.

---

## Schema is not ready, skipping group and user initialization

The browser opens a database page instead of the login page, and the log shows:

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Why this happens**

The `AnsibleForms` schema is missing or incomplete. An *empty* database is provisioned automatically at startup, unless
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) is `0`. If that fails, for example because
the database user may not create a schema, the log says `Failed to create the schema automatically : <reason>`. A schema
that exists but misses tables (`Table '<name>' is not present`) is never recreated automatically, because creating the
schema drops every table first. The database page then says *It appears that you have an unuseable schema*.

**How to fix it**

On a fresh install, give the database user the right to create the `AnsibleForms` schema and restart, or press
**Create** on the database page. On a partly present schema, restore a backup or remove the incomplete `AnsibleForms`
schema so that AnsibleForms can create it again. The log lists which tables and patches failed.

---

## Schema creation is disabled

Creating the schema, from the database page or with `POST /api/v2/schema`, fails with:

```
Schema creation is disabled
```

**Why this happens**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) is `0`, which turns off both the automatic
creation at startup and the endpoint. On a database that already has users, the endpoint also refuses callers who are not
logged in as an administrator, with `Schema creation requires an authenticated administrator`.

**How to fix it**

Create the schema with `ALLOW_SCHEMA_CREATION=1` once (it is the default), or restore it from a backup, and then set the
variable back to `0`. On a provisioned database, log in as an administrator before you recreate the schema, and remember
that it drops and recreates every table.

---

## Config seed failed, refusing to start

The container exits right after startup, and its output ends with:

```
Config seed failed, refusing to start : <reason>
```

**Why this happens**

The file in [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) could not be applied: it is not valid
YAML or breaks the seed schema, for example; `<reason>` says what went wrong. AnsibleForms refuses to start rather than
run with half of its declared objects. The reason is also written to standard error, so `docker logs` and `kubectl logs` show it.

**How to fix it**

Correct what `<reason>` names and start again. See [Reloading and startup](seed/reloading.html) for how the seed is
applied, and [Example](seed/example.html) for a valid file.

---

## ENCRYPTION_SECRET is not set

Every start logs this warning:

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET before you store credentials : changing it later makes the existing ones unreadable.
```

**Why this happens**

Stored passwords (credentials, the LDAP bind password, AWX tokens, the mail password, OAuth2 client secrets) are
encrypted with [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET). Without it, a key that is public
in the source code is used. The same applies the other way round: when the secret changes, the stored passwords can no
longer be decrypted, so LDAP logins, credentials and AWX connections that worked before start failing.

**How to fix it**

Set `ENCRYPTION_SECRET` before you store any password, and keep it with your other secrets: backups never contain it.
If you changed it by mistake, set the old value back. Otherwise re-enter every stored password after the change.

---

## Schedule is running, skipping, this is not normal

The log repeats this error, and scheduled jobs stop running:

```
Schedule is running, skipping, this is not normal, this means 2 instances are running against the same database
```

**Why this happens**

A schedule is still marked as running while this instance has nothing running. AnsibleForms is a single-instance
application, and this usually means a second instance uses the same database. At startup an instance releases schedules
that a crash left at running, with `Released <n> schedule(s) left at 'running' by a previous run`.

**How to fix it**

Run a single instance. See [Deployment topology](faq.html#deployment-topology-single-instance-only) in the FAQ.

---

## Could not load the forms

The dashboard shows no forms and reports:

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Why this happens**

The base configuration (`config.yaml`) could not be read or is not valid. The `<reason>` says which:

| Reason | Cause |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | A YAML syntax error |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | An empty file, or one with only comments |
| `Duplicate role name(s) : <names>. Each role must appear once.` | The same role is defined twice |
| `There is no config.yaml nor could one be created from template.` | `config.yaml` is missing and its folder is not writable |
| `There is no forms directory nor could there be one created from template.` | The forms folder is missing and cannot be created |
| Any other line | The configuration breaks the schema, for example a role without `groups` |

**How to fix it**

Correct the file named by [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH), or the `config.yaml` in the
repository used for config. When files are missing, make [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) and
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) point at a writable, persistent location. See
[config.yaml](config/) for the structure.

---

## The base config has a forms section

After an upgrade from 6.x the dashboard is empty, and the warnings panel shows:

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Why this happens**

Since 7.0.0, every form lives in its own file in the forms folder. Forms that are still listed in `config.yaml` are
ignored.

**How to fix it**

Move each form to its own file in [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). See
[Upgrading to 7.x](upgrade-7.html).

---

## A form is missing from the dashboard

A form file exists, but a user does not see the form on the dashboard.

**Why this happens**

A user sees a form only when one of the form's `roles` is one of the user's roles; admins see every form. Every user has
the `public` role, so a form with `roles: [public]` is visible to all. A user's roles come from the groups and users
listed under `roles` in `config.yaml`. A form without `categories` appears under **Default**, so it is missing from the
other categories, though still listed under **All Forms**. Finally, a form that fails validation is skipped. The
dashboard then shows a **This config has Warnings or Errors** button, which opens messages such as:

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**How to fix it**

Open the warnings panel and correct what it lists. Check the user's roles under
[Permissions](profile/permissions.html) in the profile, and the form's `roles` and `categories`. See
[Roles](config/roles.html) and [Categories](config/categories.html). When two files define the same form name,
the first one loaded wins.

---

## Could not save the forms

Saving in the designer fails with:

```
Could not save the forms.

Failed to save forms

<messages>
```

**Why this happens**

The designer validates every form against the schema before it writes anything. Each line of `<messages>` names the
form and the field that break a rule. Options removed in 7.0.0 get a message of their own, for example
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**How to fix it**

Correct the fields that the messages name. For options that 7.0.0 removed, follow [Upgrading to 7.x](upgrade-7.html).
To validate form files before they reach AnsibleForms, see
[VS Code Validation for Form Files](faq.html#vs-code-validation-for-form-files) in the FAQ.

---

## The editor is read-only

The designer shows **Locked** with another user's name, and saving fails with:

```
The editor is read-only
```

**Why this happens**

Only one person at a time can edit the forms. The lock is taken when someone starts the designer, and it stays until
they stop it, even when they closed the browser without stopping it. The API refuses a save from anyone else with
`Designer is locked by <username>`.

**How to fix it**

Ask `<username>` to stop the designer. If that is not possible, use **Force Unlock** in the designer. Whoever holds the
lock loses the changes they have not saved.

---

## Abuse attempt of eval function

An expression field shows an error, and the log has a line such as:

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Why this happens**

Server-side expressions are checked before they run. They may only call `fn.` and `fnc.` functions; multiple statements,
multiple lines, template literals, `process.env` and words such as `require` or `constructor` are refused. The message
says which rule was broken. With [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) set to
`off`, every server expression fails with
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**How to fix it**

Rewrite the expression as a single `fn.` call or a plain operation, or run it in the browser with `runLocal: true`. See
[Expressions](expressions/) and [Local expressions](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

A field that calls a REST API stays empty, and the log shows:

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Why this happens**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) is set, and the host of the URL is not in it.
A host that matches [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) is refused with
`blocked by REST_DENIED_HOSTS entry "<entry>"`, and a host that does not resolve with `cannot resolve <host>`.

**How to fix it**

Add the host name, or a CIDR that covers its addresses, to `REST_ALLOWED_HOSTS`, or remove the entry that blocks it from
`REST_DENIED_HOSTS`. See [Restricting REST helper destinations](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

The login page refuses a user name and password with:

```
Authentication failed: Invalid credentials
```

**Why this happens**

The login page gives the same answer for every failure, so that it does not reveal whether a user exists. AnsibleForms
tries the local users first and LDAP after, and the real reason goes to the log. LDAP failures are logged as
`Error connecting to ldap : <reason>`, with reasons such as `Wrong binding credentials` or
`Unable to verify the certificate`; Active Directory codes are translated to `Wrong password`, `User not found`,
`Account disabled`, `Account locked` or `Password expired`.

**How to fix it**

Read the reason in the log. For the full reason of every failed login, set
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) to `debug`, which logs `Ldap authentication failed : <reason>`.
If the local admin password is lost, see [Recovering a lost admin password](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Testing the LDAP connection in the settings fails with one of these:

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Why this happens**

The bind user or its password is wrong, the server or port cannot be reached, or, with **Enable TLS**, the server's
certificate cannot be verified against the certificate and CA bundle in the settings. A test user that does not exist
still counts as a successful test, because the connection and the bind worked.

**How to fix it**

Correct **Bind User Dn** and **Bind User Password**, the server and the port (usually 389, or 636 for LDAPS). For TLS
problems, paste the CA bundle that signed the LDAP server's certificate; **Ignore Certs** skips the check, but is not
for production. See [LDAP](authentication/ldap.html).

---

## Azure AD or OIDC authentication failed

A single sign-on login returns to the login page with:

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Why this happens**

The identity provider sent the user back, but AnsibleForms could not complete the login. Common reasons are
`azuread login is not enabled` or `oidc login is not enabled` (the provider is switched off), and `jwt expired`, because
the hand-off from the provider is valid for 5 minutes only. An error during the callback from the provider is shown
on the login page as well, and logged.

**How to fix it**

Enable the provider under **OAuth2 Providers**, and register the callback URL in the identity provider exactly as
AnsibleForms uses it: `https://<your host>/api/v2/auth/azureadoauth2/callback` for Entra ID, or
`https://<your host>/api/v2/auth/oidc/callback` for OIDC. Callback URLs from before 6.1.5 must be updated. Retry the
login after an expired hand-off.

---

## Not authenticated, login is not enabled for this user

A user with a valid password cannot log in, and gets:

```
Not authenticated, login is not enabled for this user.
```

**Why this happens**

One of the user's roles sets the role option `allowLogin` to `false`. The log says
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**How to fix it**

Remove `allowLogin: false` from the role, or take the user out of that role. See [Roles](config/roles.html).

---

## Logged out after a restart or after a day

Every user is sent back to the login page after AnsibleForms restarts, or after a day of use.

**Why this happens**

When [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) is not set, every start generates a
new signing key, and logs
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
Tokens from before the
restart are then no longer accepted. Independently, a session ends when its refresh token expires
(`Refresh token is expired`), after
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), 24 hours by default.

**How to fix it**

Set `ACCESS_TOKEN_SECRET` to a fixed, secret value. Raise `ACCESS_TOKEN_REFRESH_EXPIRATION` if a day is too short. For
long-lived API access, use an [API token](profile/api-token.html).

---

## Playbook failed with status

An Ansible job ends as failed, and the last line of its output is:

```
[ERROR]: Playbook failed with status (<code>)
```

**Why this happens**

`ansible-playbook` exited with a non-zero code. The lines above it hold Ansible's own error: the playbook could not be
found, a host was unreachable, a task failed, or the inventory is wrong. The playbook is looked up in the repository
with **use for playbooks** enabled, or in [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH); the log line
`Running from directory : <path>` shows the folder that was used.

**How to fix it**

Read the job output above the last line. When the playbook is not found, check the form's `playbook` against the
folder in `Running from directory`. See [Ansible forms](forms/ansible.html).

---

## Playbook was aborted by the main process

An Ansible job with a lot of output ends as failed with:

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Why this happens**

The playbook was stopped without anyone aborting it. The usual cause is output that passed
[`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (1 MB by default); the log then says
`Output passed PROCESS_MAX_BUFFER (<bytes> bytes), stopping the playbook`.

**How to fix it**

Raise `PROCESS_MAX_BUFFER`, or reduce the output of the playbook, for example by running it without verbose mode.

---

## Failed to launch awx template

An AWX job ends as failed, with output that starts with:

```
failed to launch awx template <name>
```

**Why this happens**

The next line gives the reason. `Request failed with status code 401` means the token or user name and password of the
AWX connection is refused. `could not find job template <name>` means neither a job template nor a workflow job template
has that exact name, or the connection's user cannot see it. A certificate error, such as
`unable to verify the first certificate`, means the AWX certificate is not trusted.

**How to fix it**

Use **Test Connection** on the AWX connection, which answers `AAP connection is OK` when it works. Renew the token or
password, check the template's name and permissions, and for certificate errors paste the CA into **Ca Bundle**. Enter
the URI without `/api/v2`: AnsibleForms adds [`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX) itself.
See [AWX forms](forms/awx.html).

---

## A job shows the status abandoned

A job that was running is now marked `abandoned`, and the log shows `Abandoned <n> jobs`.

**Why this happens**

A running job's process lives inside AnsibleForms. When AnsibleForms restarts, every job that was still running is
marked `abandoned`, because nothing is tracking it any more. Each hour, jobs that have been running for more than a day
are marked abandoned too.

**How to fix it**

Relaunch the job. Restart AnsibleForms while no job is running. Check whether the playbook really finished on the
managed hosts before you relaunch, because it may have run partly.

---

## The form data is not valid

With launch validation on `enforce`, a launch is refused with `422` and:

```
The form data is not valid
```

**Why this happens**

The server checked the field values against the form's rules and found missing or invalid fields; the response lists
them under `details`. A launch without `rawFormData` is refused too. A form that cannot be checked yet, such as a wizard,
is refused with `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`.

**How to fix it**

Correct the fields the details name, or the form's rules if they are too strict. Run under `log` first: it logs
`Launch validation would refuse form '<name>' ...` without refusing anything. See
[What enforce does](launch-validation/log-and-enforce.html#what-enforce-does) and
[Rolling it out](launch-validation/rolling-it-out.html).

---

## A repository clone or pull failed

A repository shows a failed status, and its output holds git's error, or the log shows
`Background clone of '<name>' failed : <reason>`.

**Why this happens**

Git could not reach or authenticate to the remote. For SSH URLs (`git@host:path`), the remote must accept the public
key of AnsibleForms; for HTTPS, the user name and token must be valid. A pull is also refused when the working tree has
changes, with
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**How to fix it**

For SSH, copy the public key from **SSH Key** in the settings and add it as a deploy key, or to a user with access to the
repository. AnsibleForms adds the remote host to the known hosts on a clone; for other hosts, use **Known Host**. For
HTTPS, renew the token. See [Git Repositories](gui/designer-and-git.html#git-repositories) and
[About Repositories](faq.html#about-repositories).

---

## The forms repository is not cloned yet

Saving forms in the designer fails with:

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Why this happens**

A repository with **use for forms** enabled has no working tree yet, because the clone has not run or failed.

**How to fix it**

Clone the repository from the repositories settings. If the clone fails, see
[A repository clone or pull failed](#a-repository-clone-or-pull-failed).

---

## A backup failed

A backup fails, and nothing is added to the list of backups. The reason is one of:

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Why this happens**

The dump command, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), is not installed, failed to
connect, or produced an empty file. A large database can also take longer than
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), one hour by default.
A failed backup leaves no folder behind; the log says `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**How to fix it**

Install the MySQL or MariaDB client tools, or set `MYSQLDUMP_COMMAND` (and `MYSQL_COMMAND` for restores) to a command
that works on this host and against your server's version. Raise `BACKUP_COMMAND_TIMEOUT_SECONDS` for a large database.
See [Backups](gui/administration.html#backups).
