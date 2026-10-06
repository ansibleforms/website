---
layout: default
title: API token
parent: Your profile
nav_order: 5
---

# API token
{: .no_toc }

Create a token for scripts and AI agents
{: .fs-6 .fw-300 }

---

A long-lived token lets scripts call the API without your password. It needs the `extendedTokenExpiration` role option:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      extendedTokenExpiration: true
```

To create a token:

1. Select how long the token stays valid: 30, 90, 180 or 365 days. Choose the shortest period
   your script needs.
2. Enter your password to confirm your identity. The password is not stored in the token.
3. Click **Create token** under the card, then copy the token with **Copy**.

The token is shown **only once**, and it **cannot be revoked** before it expires: it is a
signed token that the server validates on its own, not a session the server stores. Treat it
like your password and keep its lifetime short.

Send the token in the `Authorization` header of each API call:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

API tokens require a password, so they are only available for local and LDAP accounts.
A script can also request a token itself through the login API and its `expiryDays`
parameter (`POST /api/v2/auth/login?expiryDays=90`), which is what this view does.
