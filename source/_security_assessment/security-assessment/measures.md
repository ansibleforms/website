---
layout: default
title: Security measures
nav_order: 2
---

# Security measures
{: .no_toc }

How sign-in, permissions, secrets and connections are protected
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Where it runs

AnsibleForms is self-hosted, on your infrastructure, with its data in a database you run.

* There is no AnsibleForms cloud service or licence server, and no telemetry or update check.
* The interface is served by the application itself and loads nothing from another site.
* The application connects only to the systems an administrator configures, listed in [Outbound connections](#outbound-connections).

The parts and what each one holds:

| Part | What it does | What it holds |
|---|---|---|
| Application | The web interface, the REST API, the scheduler | No data of its own: everything is in the database |
| MySQL or MariaDB | The application's database | Users, groups, credentials (encrypted), jobs with their extravars and output, the audit log |
| Runtime environment (RTE) | Runs the playbooks, in its own container | The files of the jobs it runs, and a job's secrets only while that job runs |
| Persistent folder | The configuration, forms, playbooks and uploads | The files the forms and playbooks use |

See [How it works](../how-it-works.html) for the full picture, and [RTE](../rte/) for the runtime environment.

---

## Signing in

Every page and API call that reads or changes data needs a signed-in user. The few endpoints open without one serve the
sign-in itself, the version, the name and logo of the instance, the API documentation, and the database setup of a first start,
which [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` closes:

| Method | How it works |
|---|---|
| Local accounts | Passwords hashed with bcrypt, a [minimum length](../security/hardening.html#sign-in-limits-and-passwords), and the public default admin password must be changed at the first sign-in |
| LDAP / Active Directory | The directory checks the password, and its groups map to roles. See [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Single sign-on through your identity provider, which also brings its own multi-factor authentication. See [Authentication](../authentication/) |

* Failed sign-ins [lock the account](../security/hardening.html#sign-in-limits-and-passwords), and the sign-in is rate limited.
* A sign-in returns a signed access token valid 30 minutes and a refresh token valid 24 hours.
* Tokens can be ended before they expire: signing out, a password change, a blocked user and a revoked API token end them on
  every node at once, see [Tokens](../security/secrets.html#tokens).
* AnsibleForms has no multi-factor authentication of its own: use single sign-on where it is required.

---

## Permissions

What a user may do comes from the roles of their groups, checked by the server on every request:

* Roles are defined in [config.yaml](../config/roles.html): which forms a user sees, and which options they have,
  such as the designer, the settings pages or the jobs of other users.
* The server checks every launch against the form's rules (its fields, their values and the user's access), including
  launches through the REST API, see [Launch validation](../launch-validation/).
* The admin role runs any playbook by design. Other roles get only what is granted: a user with several roles gets an
  option only when none of those roles refuses it, so one restrictive role is enough to withhold it.

---

## Stored secrets

Passwords, tokens and keys are encrypted before they are written to the database:

* Every stored secret, credentials, the LDAP bind password, runner tokens, single sign-on client secrets, webhook
  addresses and API keys, is encrypted with AES-256 and a random initialisation vector per value, under the
  [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets) you set.
* No API call or settings page shows a stored secret, and backups omit the master secrets.
* Secrets can stay in your vault: [HashiCorp Vault and CyberArk](../secret-stores/) are read when a job needs them.
* A job's secrets reach the runtime environment sealed with AES-256-GCM, under a key derived from its token.
* Extravars whose name looks like a secret are masked in the job view, and password fields always are, see [Job data](../security/hardening.html#job-data).

The rest of the database, jobs, their extravars and their output, is stored as it is: protect it with the database's own
encryption at rest and access control, see [The database](../security/hardening.html#the-database).

---

## Audit trail

Every change, and every attempt that is refused, is recorded:

* Each create, change and delete, through the interface or the API, is written to the audit log with the user, their
  address, the action, the object and the outcome. Refusals and sign-ins are recorded too, failed ones included.
* Values that look like secrets are redacted before they are written.
* The log is kept 365 days by default, and can be copied to syslog over UDP, TCP or TLS.

---

## In the browser

The interface is protected against code injected into a page:

* A [Content-Security-Policy](../security/hardening.html#the-content-security-policy) allows only the application's own scripts and frames.
* Every answer carries protective headers: nosniff, frame protection, and HSTS over HTTPS.
* The HTML of forms, help texts and chat answers is sanitized, and job output is escaped.

---

## On the server

The code that handles user input avoids the classic injections:

* Database queries pass their values as parameters, never as text glued into the query.
* Commands, git included, run from an argument list, never a shell, so shell characters do nothing.
* Server expressions pass an [expression sanitizer](../security/hardening.html#expressions-and-outbound-calls), and their REST calls a host filter.
* The [MCP server](../mcp/), the [chat assistant](../chat/) and the metrics endpoint are off until you turn them on.

---

## Connections

Traffic to and from AnsibleForms can be encrypted end to end:

* The application serves [HTTPS](../security/https.html) itself, or sits behind your reverse proxy.
* A runtime environment talks to the application over a WebSocket, `wss://` with an HTTPS address, and the application
  pins the certificate of an inbound one, see [RTE modes](../rte/modes.html).
* LDAP, single sign-on, the runners, git, the secret stores and the REST calls of expressions check the certificate of the
  server they reach, unless an administrator turns the check off for a server with a self-signed certificate.

### Outbound connections

AnsibleForms connects only to what an administrator configures:

| Connection | When |
|---|---|
| LDAP, OpenID Connect, Entra ID (Microsoft login and Graph) | When that sign-in method is set up |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | When a form runs on that runner |
| Git servers | When a repository is set up |
| Mail server, Slack, Teams, Telegram, webhooks | When a notification channel is set up |
| HashiCorp Vault, CyberArk | When a secret store is set up |
| A model provider (Anthropic, OpenAI and others) | Only with the [chat assistant](../chat/) on, which is off by default |
| Hosts and APIs named in forms | When a form's expressions or a playbook call them |
| Syslog servers | When audit or log forwarding is set up |

---

## The containers

The images are built to run with as little privilege as possible:

* The application and the runtime environment run as the unprivileged `node` user, not as root.
* They are built on slim Debian images pinned by digest, see [Secure development](development.html#code-analysis-and-dependencies).
* The application listens on one port, 8000.

For the steps that secure a new instance, follow [Hardening](../security/hardening.html).
