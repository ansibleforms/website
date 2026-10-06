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

## Log in

Log in with basic authentication, with the user's name and password:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

The response holds two tokens:

```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```

## Call the API

Send the access token as a bearer token with every call:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <accessToken>"
```

## Refresh the token

The access token expires (`ACCESS_TOKEN_EXPIRATION`, 30 minutes by default). Get a new one with the refresh token,
without the password:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshToken": "<refreshToken>" }'
```

## Long-lived tokens

A script that runs unattended can use a token that lasts longer. It needs the `extendedTokenExpiration` role option:

* Create one under [Profile > API token](../profile/api-token.html).
* Or log in with `expiryDays`, for a token valid that many days:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u automation:<password> -d expiryDays=90
```
