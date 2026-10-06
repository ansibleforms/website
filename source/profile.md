---
layout: default
title: Your profile
nav_order: 7.7
description: Your account, preferences, password, permissions and API tokens
---

# Your profile
{: .no_toc }

Everything about your own account in one page: who you are signed in as, how AnsibleForms
looks for you, your password, what your roles allow, and long-lived tokens for the API.
Open it from the avatar at the top right of every page: **Profile**.

1. TOC
{:toc}

## Opening a view

The left menu holds the profile's views, in alphabetical order. Each view has its own address,
so you can link straight to one:

| View | Address |
|---|---|
| Account | `/profile?view=account` |
| API token | `/profile?view=token` |
| Password | `/profile?view=password` |
| Permissions | `/profile?view=permissions` |
| Preferences | `/profile?view=preferences` |

A view you may not open, such as API token without the role option it needs, is left out of
the menu, and its address opens the first view of the menu instead.

## Account

Account shows who you are signed in as and what decides your access:

- **Username** and **Login type**: a local account, LDAP, Azure AD or OpenID Connect.
- **Groups**: the groups your login brought along, as `local/admins` or `ldap/Domain Admins`.
- **Roles**: the roles those groups and your user match in `config.yaml`. They decide which
  forms you see and which options below you have.

## Preferences

Preferences change how AnsibleForms looks for you. Each choice is kept in the browser you make
it in, so a second browser or computer starts from the defaults again.

| Setting | Choices | Also set from |
|---|---|---|
| Language | English, Nederlands, Français, Italiano, Deutsch, Español | the flag in the header |
| Theme | Light, Dark, or Color (a header in a color you pick) | the sun icon in the header |
| Forms view | Tiles or List | the button on the Forms page |
| Time zone | UTC, this browser's zone, or any zone by name | only here |

### Time zone

Dates and times across AnsibleForms are shown in the time zone you pick. That covers job start
and end times, the audit log, the status page, backups, stored jobs, and the expiry of an API
token. Changing it updates every page at once, without a reload.

The default is **UTC**, how AnsibleForms always showed its times. **This browser** follows the
zone of the computer you are on, and the list holds every zone by name, such as
`Europe/Madrid`. The card shows the current time in the zone you picked.

Two things keep the server's own times:

- **The server log and job output** are text with the times the server wrote into them.
- **Times you type in**, such as when a planned job should run, and cron schedules, work as
  before.

## Password

Password changes the password of a local account. It asks for your current password, the new
one twice, and saves with **Change password** under the card.

Accounts that sign in through LDAP, Azure AD or OpenID Connect have their password managed by
that provider, so this view explains that instead of showing the form.

## Permissions

Permissions lists what your roles allow, grouped in Pages and menus, Jobs, and Other. Each row
shows the option's key, what it does, and whether you have it: **Allowed** or **Not allowed**.

Options come from the `options` of your roles in `config.yaml`, and the
[config.yaml](config) page explains how they combine across roles.

## API token

API token creates a long-lived token for scripts and the API, without a script having to hold
your password. The view is only there for roles with the `extendedTokenExpiration` option:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      extendedTokenExpiration: true
```

To create a token:

1. Pick how long it stays valid: 30, 90, 180 or 365 days. Pick the shortest time your script
   needs.
2. Enter your password, to confirm it is you. It is not stored in the token.
3. Click **Create token** under the card, and copy the token with **Copy**.

The token is shown **only once**, and it **cannot be revoked** before it expires: it is a
signed token the server checks on its own, not a session it keeps. Treat it like your
password, and keep its lifetime short.

Send it in the `Authorization` header of each API call:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

API tokens are created with a password, so they are only available for local and LDAP
accounts. A script can also ask for one itself, with the login API and its `expiryDays`
parameter (`POST /api/v2/auth/login?expiryDays=90`), which is what this view does.
