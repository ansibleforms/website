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

1. TOC
{:toc}

---

## Who can make one

A long-lived token lets scripts call the API without your password. From 7.3.0 it needs the `allowApiTokens` role option:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Up to 7.2.0 the option was `extendedTokenExpiration` alone. A role from before 7.3.0 that sets only that option is given
`allowApiTokens`, so it keeps its tokens; with both, a token can also be made that never expires. See [Role options](../config/roles.html#role-options).

---

## Create a token

**New token**, on the title line of **Profile > API tokens**, opens a wizard in three steps:

1. **Details**: a name, so you recognise the token in the list, and how long it stays valid. The choices are 30, 90, 180
   or 365 days up to [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 by default), that
   maximum itself, and **Never expires** with `extendedTokenExpiration`. Choose the shortest period your script needs.
2. **Confirm**: a local or LDAP account enters its password, which is not stored in the token. A Microsoft Entra ID or
   OIDC account has no password here: its token is made from its session, which must have signed in at most 10 minutes
   before, so the provider may ask you to sign in again first.
3. **Copy**: the token, shown **only once**. Copy it with **Copy** and keep it as safe as a password.

Send the token in the `Authorization` header of each API call:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

An API token cannot make another one. An SSO account's token carries the roles of its last sign-in: a group change at the
identity provider reaches it only when you sign in again and make a new token.

---

## Your tokens

The tokens you made are listed with their name and when each was created, expires and was last used; **Revoke** in a row's menu ends one.
An admin sees and revokes them on your page under **Settings > Users** too. A token ends at its expiry, or sooner:

- **a revoke**, from the list;
- **a logout with the token** (`POST /api/v2/auth/logout` with the token in the `Authorization` header), which ends it with
  the session it was created in;
- **a password change**, which ends every token and session of your account created before it, and a block of your account.

A token that never expires still ends in these cases. A script can also request a token itself through the login API and
its `expiryDays` parameter (`POST /api/v2/auth/login?expiryDays=90`, or `expiryDays=never`); a longer `expiryDays` is cut
to `API_TOKEN_MAX_DAYS`.
