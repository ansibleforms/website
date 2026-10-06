---
layout: default
title: Local accounts
parent: Authentication
nav_order: 1
---

# Local accounts
{: .no_toc }

The built-in admin, and the users and groups stored in the AnsibleForms database
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The built-in admin

Each start creates the local `admins` group and admin user if missing; three variables control the admin:

| Variable | Default | Meaning |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Username of the admin, created in the `admins` group when no user has that name. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Password given to the admin when it is created (or reset). |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` resets the admin's password to `ADMIN_PASSWORD` and puts it back in `admins`. |

`ADMIN_PASSWORD` is only used when the user is created or reset: changing it later does nothing on its own.

{: .warning }
> Change the default password right after the first login, on the profile page or with **Change Password** on the **Users** page.

Changing `ADMIN_USERNAME` after the first start creates a second admin user with that name; the old one is kept.

{: .warning }
> `REINIT_ADMIN=1` resets the password at **every** start while it is set. Use it to recover a lost admin password,
> then remove it and restart.

---

## Users and groups

Local users and groups are managed under **Access > Users** and **Access > Groups**. A user has these fields:

| Field | Meaning |
|---|---|
| Username | The login name. Must be unique. |
| Password | Stored as a hash. Change it later with the **Change Password** action. |
| Email | Optional. |
| Group | The user's local group. A local user belongs to exactly one group. |

Local users change their own password on their profile; other users do so in their directory or identity provider.

{: .warning }
> Deleting a group also deletes every user in it. The `admins` group is recreated at the next start, but its users are not.

---

## Mapping to roles

Roles name local groups as `local/<group>` and users as `local/<user>`; by default `admins` gets `admin`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
  - name: operator
    groups:
      - local/operators
    users:
      - local/svc-backup
```

Keep `local/admins` in the `admin` role, so the built-in admin can always sign in, even when the directory or the
identity provider is unavailable. When config.yaml cannot be loaded at all, members of `local/admins` still get the
`admin` role, so you can sign in and fix it. See [Roles](../config/roles.html) for the role options.

---

## Local accounts and LDAP

A username and password login checks the local users before LDAP. When a local user has the same name as a directory
user, the local account always wins and the directory password does not work for that name. Give local accounts names
that cannot clash with directory accounts, for example a `svc-` prefix.
