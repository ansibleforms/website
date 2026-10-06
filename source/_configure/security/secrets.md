---
layout: default
title: Secrets and encryption
parent: Security
nav_order: 3
---

# Secrets and encryption
{: .no_toc }

The two master secrets, what they protect, and how long sessions and tokens last
{: .fs-6 .fw-300 }

1. TOC
{:toc}

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
