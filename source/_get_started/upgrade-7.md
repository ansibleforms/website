---
layout: default
title: Upgrading to v7
parent: Upgrading
nav_order: 0.5
---

# Upgrading to v7
{: .no_toc }

What to change while still on 6.5, and what changes when you move to version 7
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Version 7 drops everything 6.x deprecated; fix it first on 6.5, where old and new both work, then upgrade.

---

## Before you upgrade (on 6.5)

### Forms live in their own files

Forms live only in the forms folder (`FORMS_FOLDER_PATH`) or a forms repository; `config.yaml` keeps categories, roles and constants.

- **A `forms.yaml` file:** rename it to `config.yaml`. On 6.5 the settings page has a
  **Convert forms.yaml to config.yaml** button for this.
- **A `forms:` section in the base config:** version 7 rejects it. Move each form to its own file, for example
  by dragging it to a file in the 6.5 designer.
- **Environment variables:**

  | Removed | Use instead |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` and `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### The `table` field

Version 7 rejects `table` fields, and their properties (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`) go with them: use a `list` field with a `subform`, and turn each column's `from` into an expression
on `__parent__` (see the [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Renamed properties

Each removed property has a direct replacement:

| Removed | Use instead |
|---|---|
| `disableRelaunch: true` (form) | `allowRelaunch: false` |
| `noOutput: true` (field) | `output: false` |
| `enableLogin` (role option) | `allowLogin` |

### Datasources and data schemas

The datasource imports and their admin pages have been removed, as has the
AnsibleForms Galaxy collection, whose modules only served them.

- Scheduled imports stop and the datasource tables are dropped: note down what you need first.
- The data schemas an import filled are databases of their own and stay. A form that
  queries them through a credential keeps working.
- To keep that data fresh, run the import as a playbook of your own, for example from a
  schedule.

### API v1

`/api/v1/*` has been removed; use `/api/v2/*` (interactive docs at `/api/v2/docs`). The calls
scripts typically use are:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

v2 responds with HTTP status codes (`400`, `403`, `404`, `422`) and a plain JSON body, not v1's
`{ status, message, data }` envelope.

---

## What changes in 7

Version 7 changes how playbooks run and tightens several defaults. Check each item below when you move from 6.5.

### Playbooks run on an RTE

Version 7 no longer runs `ansible-playbook` in the AnsibleForms container. Playbooks run on a runtime environment (RTE),
a container of its own, and the app image no longer contains ansible or python. Start an RTE next to the app, from the
`ghcr.io/ansibleforms/ansibleforms-rte-full:7` image, with these settings:

| Setting | Value |
|---|---|
| `AF_ROLE` | `rte`. The RTE images set it already. |
| `RTE_TOKEN` | A token of at least 16 characters. The app sends it with every call, and the RTE refuses to start without one. |
| `RTE_URL` | The address the app reaches the RTE on, for example `http://rte:8000`. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | The same database as the app. |
| `ENCRYPTION_SECRET` | The same value as the app. Only needed when the RTE registers itself. |

Then move the ansible mounts from the app container to the RTE:

- `ansible.cfg` at `/etc/ansible/ansible.cfg`, your roles at `/etc/ansible/roles` and your collections at
  `/etc/ansible/collections`.
- Mount the same persistent folder as the app on the RTE too, so that it finds the playbooks and the repositories.

An RTE adds itself under **Connections → Runners** when it starts, and the first one becomes the default runner, so
playbook forms run on it at once. With `RTE_REGISTER=0` it does not: add it under **Connections → Runners** yourself, or
in the `runners:` section of the [config seed](seed/). See [Runners](runners.html) and [Scaling](production/scaling.html).

{: .warning }
> **Same release for the app and the RTE** The app resolves a job's credentials and hands them to the RTE sealed for
> that RTE (RTE contract 2). An RTE of an older contract is refused: run the RTE image of the same release as the app,
> and upgrade both together.


### What the RTE image contains

The RTE comes in three layers, each built on the one before. Pick the one that fits your playbooks:

| Image | Contents |
|---|---|
| `ansibleforms-rte-full` | The default. Ansible 14 with ansible-core 2.21, and the collections and python libraries the 6.5 image had. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core and a few common libraries, without collections. Add your own in an image built on it. |
| `ansibleforms-rte-base` | The server only, without python or ansible, to build an RTE with your own versions. |

Moving from 6.5 (ansible 12 with ansible-core 2.19) also changes these for your playbooks:

- **ansible-core 2.21:** read the [porting guides](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  for 2.20 and 2.21.
- **Python 3.14:** the RTE layers run on python 3.14.
- **No more `boto`:** the old `boto` 2 library is gone. The `amazon.aws` collection uses `boto3`, which is included.

Two environment variables now belong to the RTE and are no longer read by the app, so set them in the RTE container:

| Variable | Change |
|---|---|
| `ANSIBLE_PATH` | The playbook folder, on the RTE. |
| `PROCESS_MAX_BUFFER` | Now 50 MB by default. Past it, the job output is no longer stored (the job says so), but the playbook goes on instead of being stopped. |


### The containers run as uid 1000

The app and RTE images run as the user `node` (uid 1000) instead of root, and their home folder is `/home/node`:

- **Give uid 1000 the volumes, once.** For the persistent and ssh volumes, run
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v`; for a host folder, `sudo chown -R 1000:1000 <folder>`.
  On Kubernetes, set `fsGroup: 1000`.
- **Mount the ssh folder at `/home/node/.ssh`**, not `/root/.ssh`. If you set
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) to `/root`, remove it or set it to `/home/node`.
- **Your own RTE image** built on an RTE layer switches to `USER root` for its installs and back to `USER node` at the end.


### Launch validation is on

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) now defaults to `enforce` (6.5: `off`). Every
launch, from the browser or from `POST /api/v2/job`, is checked against the form's rules, and the job runs the extravars and
credentials the server builds from the checked values.

- **REST callers must send `rawFormData`**, the raw field values as the browser sends them. A launch with only
  `extravars` is refused, because its values cannot be checked.
- **To see what would be refused first**, set `LAUNCH_VALIDATION=log` and read the warnings in the log. `off` restores the
  behaviour of 6.5.

See [Launch validation](launch-validation/) for the details.


### Playbooks no longer see the app's settings

A playbook no longer inherits the environment variables AnsibleForms reads itself: `ENCRYPTION_SECRET`, the `DB_*` settings,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, the `VAULT_*` settings, every other documented variable and every `MYSQL_*` variable.
The rest of the RTE's environment, such as `PATH`, proxies, `ANSIBLE_*` settings and cloud credentials, is passed as before.

A playbook that read one of these with `lookup('env', ...)` must get the value another way: pass it as an extravar or a
credential, or set it on the RTE under another name.

### Only the admin role manages runners and admins

A user with settings access no longer has full control over who is an admin and where credentials go:

- **Runners:** only the admin role adds, changes or deletes a runner, because a runner receives the credentials of the jobs
  it runs. Users with settings access can still see and test runners.
- **Admin accounts and groups:** only the admin role grants admin. Without it, a user cannot put an account in a group the
  admin role names, nor change, reset or delete an admin account or such a group.
- **Roles:** a designer without the admin role cannot change the roles. A save or a restore whose roles differ is refused.

Give the admin role to whoever manages runners, admins and roles.

### The default password must be changed

A user who signs in with the public default password `AnsibleForms!123` must change it first. Until then, every other API
call answers `403` with the code `password_change_required`, and the browser shows the change-password page.

Sign in once and choose a new password, or set [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) before the
first start. Scripts that log in with the default password must use another one.

### Tokens end at logout and password change

A logout now ends the tokens of that session, and a password change ends every session of that user, so sign in again after
changing a password.

An API token requested with `?expiryDays=` lives at most [`API_TOKEN_MAX_DAYS`](customization/#env_API_TOKEN_MAX_DAYS) days
(90 by default). Scripts that use long-lived API tokens must request a new one before it expires.

### Entra ID needs your tenant

Entra ID (Azure AD) sign-in now uses OpenID Connect against your own tenant only, and a user of another tenant cannot sign
in. A provider without a tenant id, or with `common`, `organizations` or `consumers`, is refused.

- **Set the tenant id** on the SSO provider: the Directory (tenant) ID, a GUID, or the tenant's domain.
- **Grant the Graph permissions:** the login asks for `openid profile email User.Read GroupMember.Read.All`. Give the app
  registration the delegated Microsoft Graph permissions `User.Read` and `GroupMember.Read.All`, with admin consent.
- **Prefer group ids in roles:** name a group as `azuread/<object id>` rather than by its display name.

See [Entra ID](authentication/entra-id.html) for the setup.

### Passwords have a minimum length

A local password set through the application needs at least
[`PASSWORD_MIN_LENGTH`](customization/#env_PASSWORD_MIN_LENGTH) characters (8 by default), and cannot be the username or the
default password. `PASSWORD_MIN_LENGTH=0` turns the length check off. Existing passwords keep working.

### Run the containers with a restart policy

An uncaught exception now ends the process, logged at level `crit`, instead of leaving it running in an unknown state. Run
the containers with a restart policy, such as `--restart unless-stopped` with Docker (the docker-compose project sets it).
Kubernetes restarts the pods by itself.

### AWX connections and the home link

Two more things are gone in 7, without anything to do on 6.5:

- **AWX and AAP connections:** the `awx` table, `/api/v2/awx` and the A.A.P. page are gone. The upgrade moves every AWX or
  AAP connection to **Connections → Runners**, as a runner of type `awx`, and forms with `awx:` keep working.
- **`NAV_HOME_LABEL` and `NAV_HOME_ICON`:** no longer read. The first link of the header is always Forms.

---

## Image tags

`latest` moves to 7 with 7.0.0. To stay on 6, use the tag `6` (or `6.5`) instead of `latest`.
All tags are listed under [Image tags](installation/#image-tags).

---

## Rolling back

Take a backup before you upgrade (**Settings → Backups**). 6.5 runs on a database upgraded to 7, but only
the backup restores the dropped datasource definitions.
