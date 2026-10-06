---
layout: default
title: Security hardening
parent: Running in production
nav_order: 3
---

# Security hardening
{: .no_toc }

Secrets, tokens, expressions, optional features and role options
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The admin account

The local admin account is created at first start from [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
and [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD), whose default is `AnsibleForms!123`.

* Sign in once and change the password on the **Users** page. Changing `ADMIN_PASSWORD` afterwards has no effect,
  because the variable is only read when the account does not exist yet.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` resets the password to `ADMIN_PASSWORD` at every
  start. Use it only to recover a lost password, then unset it and restart.
* Once LDAP or OAuth2 sign-in works, keep the local admin for emergencies only, with a long password stored in your vault.

---

## The two master secrets

Two secrets protect everything else. Set both before the instance holds real data, store them outside the instance,
and never change them casually:

| Secret | What it protects | If it is not set | If it is lost or changed |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Every password and token stored in the database: credentials, the LDAP bind password, AAP tokens, OAuth2 client secrets, the mail password, the chat API key | A default key is used, which is public in the source code | Every stored secret becomes impossible to decrypt and must be entered again |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | The signature of access and refresh tokens, including long-lived [API tokens](../profile/api-token.html) | A random secret is generated at each start, so every restart signs everyone out | Every session and every API token becomes invalid |

Both are logged as a `[SECURITY]` warning at startup while they are missing. The settings pages refuse to edit them,
the API never returns them, and backups leave them out on purpose, so a lost `ENCRYPTION_SECRET` cannot be recovered
from anywhere: keep a copy in your secret manager. The encryption secret is used as a 32 character key; a shorter or
longer value is padded or cut.

Changing `ACCESS_TOKEN_SECRET` is also the only way to invalidate long-lived API tokens before they expire.

---

## Tokens

A sign-in returns a short-lived access token and a longer refresh token, which the browser uses to get a new pair:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : `30m` by default. Shorter
  limits the use of an intercepted token.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : `24h` by
  default. This is how long an idle browser stays signed in.
* The `extendedTokenExpiration` role option lets a user request a token valid for a number of days. Grant it only to
  roles that need API access from scripts.

---

## The database

AnsibleForms holds every credential and job in its MySQL database, so keep that database off the network:

* The docker-compose project publishes MySQL on the host (`MYSQLDB_LOCAL_PORT`, `3306`) and ships with the root
  password `AnsibleForms!123`. Remove that port mapping, or bind it to `127.0.0.1`, and change the password.
* Connect with a dedicated account rather than `root` where your setup allows it: `DB_USER` and `DB_PASSWORD`.
* Set [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) to `0` once the schema exists.
  Creating the schema drops every table first; with `0` neither the startup bootstrap nor the `/api/v2/schema`
  endpoint can run it.

---

## Expressions and outbound calls

Server expressions run on the server for any signed-in user, so the sanitizer and the outbound filters matter:

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : keep the default `strict`, or use
  `paranoid`. Never leave `legacy` in place: it lets every signed-in user run code on the server, and the Status page
  shows it as a warning.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : block the destinations REST expressions
  must never reach, for example `169.254.169.254,127.0.0.0/8` (cloud metadata and the host itself).
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : when set, REST expressions can reach
  only these hosts and ranges. The denied list wins over it.

Both lists only cover the REST helper functions of AnsibleForms itself; playbooks run outside them and are not filtered.

---

## Job data

Job extravars and output are stored in the database and shown to everyone who can see the job:

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : extravars whose key matches are
  shown as `********`. The default is `password|secret|token`; password fields are always masked. Extend it with
  the names your forms use, for example `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : trims the `ansibleforms_user`
  object sent with every job, which otherwise holds the user's whole group membership.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) only hides noisy tasks behind
  the **Apply filter** button. It is a readability aid, not a way to hide secrets: use `no_log` in the playbook for that.

---

## The settings pages and the designer

Administrators can change much of the configuration from the browser. Narrow that where the configuration lives elsewhere:

* [`ALLOW_ENV_EDIT`](../customization/features.html#env_ALLOW_ENV_EDIT)`=0` : the settings pages show the environment
  but cannot write it. Use it whenever the environment comes from docker-compose, Kubernetes or a GitOps tool, see
  [Editing and audit](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : removes the built-in designer when forms
  are maintained in git.

---

## Optional features

These features are off by default. Switch them on only when you use them; each needs a restart:

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : serves the [MCP server](../mcp/) on `/api/v2/mcp`,
  so MCP clients can launch forms with a user's token.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : the [chat assistant](../chat/). Form definitions
  and the values being filled in are sent to the configured model provider.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) works the other way round: it is `off` by
default and worth switching on. With `enforce`, the server refuses a launch whose values break the form's rules,
including launches through the REST API. Start with `log`, see [Launch validation](../launch-validation/).

---

## Role options

Some role options in [config.yaml](../config/roles.html) give more than their name suggests. Grant them with care:

| Option | Why it matters |
|--------|----------------|
| `allowScheduledJobs` | A user with it sees and can change every schedule, and a schedule runs with admin rights, for any form. Treat it as admin-level. |
| `allowBackupOps` | Includes **restore**, which replaces the whole database. |
| `showSettings` | Opens the administration pages. |
| `showLogs` | Shows the server log, which can contain host names, user names and error details. |
| `showAllJobLogs` | Shows the jobs of every user, not only the user's own. |
| `extendedTokenExpiration` | Lets the user create long-lived API tokens, which cannot be revoked one by one. |

When the `admin` role sets no options it has all of them; options on the `public` role apply to every user.
