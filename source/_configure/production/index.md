---
layout: default
title: Running in production
nav_order: 7
has_children: true
has_toc: false
permalink: /production/
---

# Running in production
{: .no_toc }

Publish, back up and monitor an instance that people depend on
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Before you go live

The defaults get an instance running quickly, but several of them are only meant for a first look. AnsibleForms
logs a `[SECURITY]` warning at startup when `ENCRYPTION_SECRET` or `ACCESS_TOKEN_SECRET` is not set, and the
**Status** page reports the backups, the retention settings and the expression sanitizer.

---

## Production checklist

Go through these items once before users depend on the instance, and again after a major upgrade:

| Item | What to do | Details |
|------|------------|---------|
| Admin password | Change the password of the local admin account | [Hardening](../security/hardening.html#the-admin-account) |
| Encryption secret | Set [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) before you store any credential | [Secrets and encryption](../security/secrets.html#the-two-master-secrets) |
| Token secret | Set [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET), so sessions survive a restart | [Secrets and encryption](../security/secrets.html#the-two-master-secrets) |
| HTTPS | Terminate TLS with your own certificate, not the sample one | [HTTPS](../security/https.html) |
| Reverse proxy | Publish the instance behind a proxy, optionally under [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Reverse proxy](reverse-proxy.html) |
| Schema endpoint | Set [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) to `0` once the schema exists | [Hardening](../security/hardening.html#the-database) |
| Outbound calls | Restrict REST expressions with [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Hardening](../security/hardening.html#expressions-and-outbound-calls) |
| Optional features | Leave MCP and the chat assistant off unless you use them | [Hardening](../security/hardening.html#optional-features) |
| Backups | Check that the nightly backup works, and copy it off the host | [Backups](backups.html) |
| Retention | Decide how long jobs and audit entries are kept | [Logs](logs.html#retention) |

---

## In this section

Each topic has a page of its own; securing the instance is covered under [Security](../security/):

| Page | What it covers |
|---|---|
| [Reverse proxy](reverse-proxy.html) | Publish AnsibleForms behind Nginx, Traefik or Apache, at the root or under a subpath |
| [Backups](backups.html) | Nightly backups, what they contain, restores, and what else to keep |
| [Logs](logs.html) | Log files, syslog, the audit trail, and retention of jobs and audit entries |
