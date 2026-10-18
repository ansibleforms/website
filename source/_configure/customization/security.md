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

Set `ENCRYPTION_SECRET` before the first credential is stored. From 7.3.0, setting or changing it re-encrypts every stored
secret at the next start, with `ENCRYPTION_SECRET_PREVIOUS` naming the old key when it was your own, see
[Changing the encryption secret](../security/secrets.html#changing-the-encryption-secret).

---

## REST calls and jq

From 7.3.0 the REST helper functions (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) check the
certificate of the endpoint they call, like every other connection; up to 7.2.0 they never did. Three settings apply to them:

| Variable | Default | Effect |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` skips the certificate check: only for endpoints with a self-signed certificate |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | How long a REST call waits for an answer before it fails with a timeout |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | How long a jq filter may run before it is stopped; jq output is also capped at 64 MB |

All three take effect when saved, without a restart. For an endpoint whose certificate is signed by a private CA, keep the check on
and give Node.js that CA instead: set `NODE_EXTRA_CA_CERTS` to a PEM file holding it in the app's environment, then restart the app.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="security" %}
