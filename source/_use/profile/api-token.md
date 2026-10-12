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

1. Select how long the token stays valid: 30, 90, 180 or 365 days, up to the maximum your administrator allows
   ([`API_TOKEN_MAX_DAYS`](../customization/#env_API_TOKEN_MAX_DAYS), 90 days by default). Only the lifetimes up to that
   maximum are offered, plus the maximum itself. Choose the shortest period your script needs.
2. Enter your password to confirm your identity. The password is not stored in the token.
3. Click **Create token** under the card, then copy the token with **Copy**.

The token is shown **only once**. It ends at its expiry, or sooner:

- **a logout with the token** (`POST /api/v2/auth/logout` with the token in the `Authorization` header) ends it, with the
  session it was created in;
- **a password change** ends every token and session of your account created before it.

Treat it like your password and keep its lifetime short.

Send the token in the `Authorization` header of each API call:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

API tokens require a password, so they are only available for local and LDAP accounts.
A script can also request a token itself through the login API and its `expiryDays`
parameter (`POST /api/v2/auth/login?expiryDays=90`), which is what this view does. A longer `expiryDays` is cut to
`API_TOKEN_MAX_DAYS`.
