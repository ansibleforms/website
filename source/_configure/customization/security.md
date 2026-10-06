---
layout: default
title: Security variables
parent: Environment Variables
nav_order: 6
---

# Security variables
{: .no_toc }

Tokens, encryption, outbound REST hosts, masking and the old VAULT_* settings
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Change these to set your own token and encryption secrets, and to limit what forms may call and show.

---

## Example

Your own secrets, REST calls limited to one API and an internal network, and one more masked key. In the compose project's `.env`:

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Set `ENCRYPTION_SECRET` before the first credential is stored: changing it later makes every stored credential impossible to
decrypt. [Secrets and encryption](../security/secrets.html) explains how both secrets are used and why backups leave them out.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="security" %}
