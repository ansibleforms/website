---
layout: default
title: Running in production
nav_order: 6
has_children: true
has_toc: false
---

# Running in production
{: .no_toc }

Expose, secure and back up an instance that people depend on
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
| Admin password | Change the password of the local admin account | [Security hardening](hardening.html#the-admin-account) |
| Encryption secret | Set [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) before you store any credential | [Security hardening](hardening.html#the-two-master-secrets) |
| Token secret | Set [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET), so sessions survive a restart | [Security hardening](hardening.html#the-two-master-secrets) |
| HTTPS | Terminate TLS with your own certificate, not the sample one | [HTTPS and certificates](https.html) |
| Reverse proxy | Publish the instance behind a proxy, optionally under [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Reverse proxy](reverse-proxy.html) |
| Schema endpoint | Set [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) to `0` once the schema exists | [Security hardening](hardening.html#the-database) |
| Outbound calls | Restrict REST expressions with [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Security hardening](hardening.html#expressions-and-outbound-calls) |
| Optional features | Leave MCP and the chat assistant off unless you use them | [Security hardening](hardening.html#optional-features) |
| Backups | Check that the nightly backup works, and copy it off the host | [Backups and logs](backups-and-logs.html) |
| Retention | Decide how long jobs and audit entries are kept | [Backups and logs](backups-and-logs.html#retention) |

---

## In this section

Each topic has a page of its own:

* **[Reverse proxy](reverse-proxy.html)** : publish AnsibleForms behind Nginx, Traefik or Apache, at the root or under a subpath
* **[HTTPS and certificates](https.html)** : serve HTTPS from the application itself, and replace the sample certificate
* **[Security hardening](hardening.html)** : secrets, tokens, expressions, optional features and role options
* **[Backups and logs](backups-and-logs.html)** : nightly backups, restores, what else to keep, log files and the audit trail
