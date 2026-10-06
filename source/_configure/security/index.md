---
layout: default
title: Security
nav_order: 6
has_children: true
has_toc: false
permalink: /security/
---

# Security
{: .no_toc }

Lock down an instance: the admin account, its secrets, HTTPS and what users and forms may do
{: .fs-6 .fw-300 }

---

For administrators preparing an instance for production, and for security reviews of an existing one.

---

## In this section

Each topic has a page of its own:

| Page | What it covers |
|---|---|
| [Hardening](hardening.html) | The admin account, the database, expressions, job data, optional features and role options |
| [HTTPS](https.html) | Where TLS ends, serving HTTPS from the application, and replacing the sample certificate |
| [Secrets and encryption](secrets.html) | `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, and token lifetimes |

Related pages: [Authentication](../authentication/) for sign-in methods, [Launch validation](../launch-validation/) for
server-side checks of every launch, and the [Security variables](../customization/security.html).
