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
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Every password and token stored in the database: credentials, the LDAP bind password, AAP tokens, SSO client secrets, the mail password, the chat API key | A default key is used, which is public in the source code | Every stored secret becomes impossible to decrypt and must be entered again |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | The signature of access and refresh tokens, including long-lived [API tokens](../profile/api-token.html) | A random secret is generated at each start, so every restart signs everyone out | Every session and every API token becomes invalid |

Both are logged as a `[SECURITY]` warning at startup while they are missing. The settings pages refuse to edit them,
the API never returns them, and backups leave them out on purpose, so a lost `ENCRYPTION_SECRET` cannot be recovered
from anywhere: keep a copy in your secret manager. The encryption secret is used as a 32 character key; a shorter or
longer value is padded or cut.

Changing `ACCESS_TOKEN_SECRET` ends every session and every API token at once. To end the tokens of one user or one
session, use the revocations described under [Tokens](#tokens).

---

## Tokens

A sign-in returns a short-lived access token and a longer refresh token, which the browser uses to get a new pair:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : `30m` by default. Shorter
  limits the use of an intercepted token.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : `24h` by
  default. This is how long an idle browser stays signed in.
* The `extendedTokenExpiration` role option lets a user request an API token valid for a number of days. Grant it only
  to roles that need API access from scripts.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : `90` by default. The longest an API
  token lives: a longer request is cut to it.

A token is a signed JWT, but the server also keeps a list of revoked tokens, shared by every app node, so a token
can end before it expires:

| Event | What ends |
|-------|-----------|
| Signing out | Every token of that sign-in: the access token, its refresh token, and an API token when the sign-out uses it |
| A password change, by the user or by an admin | Every token of the user issued before the change, API tokens included, on every device |
| A user's **Allow sign-in** switch turned off (local, LDAP or SSO user), or a local user deleted | Every token of the user |
| **End sessions** on the page of an LDAP or SSO user | Every token of the user; they can sign in again unless blocked |

A script ends its own API token by signing out with it: `POST /api/v2/auth/logout` with the token in the
`Authorization` header.
