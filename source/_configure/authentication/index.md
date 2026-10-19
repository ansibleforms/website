---
layout: default
title: Authentication
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
---

# Authentication
{: .no_toc }

Choose how users sign in, and how their account and groups lead to roles
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Login methods

AnsibleForms supports four login methods, and several can be active at the same time:

| Method | When to use | Page |
|---|---|---|
| Local accounts | The built-in admin, service accounts, small teams, or a fallback when the directory is down. | [Local accounts](local.html) |
| LDAP | Users and groups live in Active Directory, OpenLDAP or another LDAP directory. | [LDAP](ldap.html) |
| Entra ID | Users sign in with their Microsoft 365 / Entra ID account (single sign-on). | [Entra ID](entra-id.html) |
| OIDC | Single sign-on through another OpenID Connect provider, such as Keycloak. | [OIDC](oidc.html) |

Local accounts and LDAP are configured under **Access > Users**, **Groups** and **LDAP**; Entra ID and OIDC under
**Access > SSO**.

---

## How a login picks the method

The login page has a username and password form, plus one button per enabled single sign-on provider:

- **Username and password** are checked against the local users first. Only when no local user has that name, and LDAP
  is enabled, is the directory tried. A local user with a wrong password is refused without asking LDAP.
- **The Entra ID and OpenID buttons** appear below **Sign in** when such a provider is enabled. They send the browser to
  the provider and back; no password reaches AnsibleForms.

Only one Entra ID provider and one OIDC provider are enabled at a time: enabling one turns the others of its type off.
A failed username and password login always shows the same generic message; the reason is in the server log and the audit log.

---

## Switching single sign-on

From 7.3.0 each provider under **Access > SSO** has two switches of its own, which apply without a restart:

| Switch | Effect |
|---|---|
| **Enabled** | Shows the provider's button on the login page and accepts its sign-in. Turning it on turns off the other providers of its type. |
| **Skip the login page** | Users go straight to this provider, without the login page, while the provider is enabled. Turning it on for one provider turns it off for the others; it is greyed out on a provider that is turned off. |

The username and password form stays reachable at `/login?local`, for the local admin or when the provider fails,
and it is shown after signing out and when a single sign-on login comes back with an error.

The `ENABLE_SSO` and `SSO_AUTO_LOGIN` variables are removed in 7.3.0. The first start of 7.3.0 reads them once, and
logs a warning at every start while they are still set, so remove them from the environment after the upgrade:

| Variable before 7.3.0 | What the upgrade does |
|---|---|
| `ENABLE_SSO=0` | Turns every provider off: the providers stay configured, without a button on the login page |
| `SSO_AUTO_LOGIN=1` | Turns **Skip the login page** on for the enabled provider, when exactly one is enabled and `ENABLE_SSO` is not `0` |

---

## From user to roles

Each login produces a user with a **type** (`local`, `ldap`, `azuread` or `oidc`), a username and a list of groups.
Every group gets the prefix of its type, so an Entra ID group is stored and shown as `azuread/...`:

| Login method | Username | Groups |
|---|---|---|
| Local | the local username | `local/<group>`, one for each local group of the user |
| LDAP, `main` directory | the value of the Username Attribute | `ldap/<cn>`, the CN of each group the directory returns |
| LDAP, another directory | `<directory>/<username>` | `ldap/<directory>/<cn>`, see [Several directories](ldap.html#several-directories) |
| Entra ID | the `upn` claim, or `preferred_username` when the token has no `upn` | `azuread/<object id>` and `azuread/<display name>` of each group, read from Microsoft Graph |
| OIDC | the `preferred_username` claim | `oidc/<name>`, from the `groups` claim of the ID token |

The [roles](../config/roles.html) in config.yaml then match these values: a role applies when one of its `groups` is one
of the user's groups, or when its `users` holds `<type>/<username>`. Every user also gets the `default` role. From 7.3.0 a
role names an Entra ID member `entraid/<group>` or `entraid/<upn>`, which matches the stored `azuread/` value; `azuread/`
in a role still works and is removed in 8.0. The profile and the job extravars keep showing `azuread/`.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

A user's **profile** page lists the login type, the groups and the roles, which is the quickest way to check a mapping.
The `allowLogin` role option can refuse the login of users that match no role: set it to `false` on `default` and to
`true` on the roles that may sign in.
