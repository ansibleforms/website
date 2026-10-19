---
layout: default
title: Authentication
parent: REST API
nav_order: 1
---

# Authentication
{: .no_toc }

Log in, refresh the token, or use a long-lived token
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Every call needs an access token in the `Authorization` header. A token is obtained by logging in, and kept fresh with
the refresh token.

---

## Log in

Log in with basic authentication, with the user's name and password:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

The response holds two tokens, the access token and the refresh token:

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Call the API

Send the access token as a bearer token with every call:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Refresh the token

The access token expires (`ACCESS_TOKEN_EXPIRATION`, 30 minutes by default). Get a new one with the refresh token,
without the password:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

The response holds a new pair, in the same shape as the login. A refresh token works once: keep the new one for the next refresh.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Long-lived tokens

A script that runs unattended can use a token that lasts longer. From 7.3.0 it needs the `allowApiTokens` role option:

* Create one under [Profile > API tokens](../profile/api-token.html).
* Or log in with the `expiryDays` query parameter, for a token valid that many days:

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` is read from the URL only, never from the body. For a user whose roles lack `allowApiTokens`, it is ignored,
and the login returns a token with the usual lifetime. `expiryDays=never` needs `extendedTokenExpiration` too. Add the `name`
query parameter (`?expiryDays=90&name=nightly-backup`) to name the token in the user's token list.

A long-lived token lives [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) days at most, 90 by
default: a longer `expiryDays` is cut to it, unless it is `never`. Refreshing it returns an ordinary token, so log in again when it expires.

### Tokens of the signed-in user

The **API tokens** view of the profile uses these endpoints, which work for any account, SSO included, as they need no password:

| Call | What it does |
|---|---|
| `GET /api/v2/profile/tokens` | Lists your API tokens, with their `sid`, `name`, creation, expiry and last use |
| `POST /api/v2/profile/tokens` | Makes a token from your session; the body holds `expiryDays` (a number, or `never`) and an optional `name` |
| `DELETE /api/v2/profile/tokens/{sid}` | Revokes one of your tokens |

`POST` answers `403` when called with an API token (a token cannot make another one), without `allowApiTokens`, or when the
session signed in more than 10 minutes ago (code `sign_in_again`): sign in again first. A lifetime above the maximum answers `400`.

---

## When a token ends early

A token, long-lived or not, stops working before it expires when one of these happens:

* **A logout of its session**: `POST /api/v2/auth/logout` with the token ends that login's tokens, and only those. A
  logout in the browser does not end a script's token.
* **A password change**: the user changes their password, or an admin sets it. Every token issued before is refused.
* **The user is removed or blocked**: deleting a local user, or blocking a user, ends all their tokens. An admin can also
  end the sessions of an LDAP or SSO user.

A refused token answers `401`. Log in again, with the new password if it changed.

---

## Scripts that log in on every run

The login and token endpoints are protected against floods and password guessing, so a script that logs in each time it runs
should know these limits:

| Limit | Default | What happens |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 requests a minute from one address | Login, logout, refresh, the SSO endpoints, `PUT /api/v2/profile` (password change) and `POST` or `DELETE /api/v2/profile/tokens` answer `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 failed logins in a row | The account is locked for [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15), every login answers `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 failed logins from one address | Every login from that address answers `429` until the window ends |

A `429` carries a `Retry-After` header with the seconds to wait: stop and wait, do not retry at once. A locked account
refuses even the right password until the lockout ends, so a script with a wrong password locks out its user for everyone.
A wrong current password on a password change (`PUT /api/v2/profile`) counts as a failed login too, and a locked account
cannot change its password. A successful login clears the account's count, and so does an admin setting the password.

To stay clear of these limits, log in once and reuse the token, or use a long-lived token, instead of logging in for
every call. Behind a reverse proxy, set [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) so the server sees
the client's address, or every client counts as one.
