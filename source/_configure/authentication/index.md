---
layout: default
title: Authentication
nav_order: 3
has_children: true
has_toc: false
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
| LDAP | Users and groups live in Active Directory, OpenLDAP or another LDAP directory. | [LDAP and Active Directory](ldap.html) |
| Entra ID | Users sign in with their Microsoft 365 / Entra ID account (single sign-on). | [Entra ID](entra-id.html) |
| OIDC | Single sign-on through another OpenID Connect provider, such as Keycloak. | [OIDC](oidc.html) |

Local accounts and LDAP are configured under **Access > Users**, **Groups** and **LDAP**; Entra ID and OIDC under
**Access > OAuth2**.

---

## How a login picks the method

The login page has a username and password form, plus one button per enabled single sign-on provider:

- **Username and password** are checked against the local users first. Only when no local user has that name, and LDAP
  is enabled, is the directory tried. A local user with a wrong password is refused without asking LDAP.
- **The Entra ID and OpenID buttons** appear below **Sign in** when such a provider is enabled. They send the browser to
  the provider and back; no password reaches AnsibleForms.

Only one Entra ID provider and one OIDC provider can be enabled at a time: enabling one disables the others of that type.
A failed username and password login always shows the same generic message; the reason is in the server log and the audit log.

---

## From user to roles

Each login produces a user with a **type** (`local`, `ldap`, `azuread` or `oidc`), a username and a list of groups.
Every group gets the type as prefix:

| Login method | Username | Groups |
|---|---|---|
| Local | the local username | `local/<group>`, the user's one local group |
| LDAP | the value of the Username Attribute | `ldap/<cn>`, the CN of each group the directory returns |
| Entra ID | the `upn` claim | `azuread/<display name>`, read from Microsoft Graph |
| OIDC | the `preferred_username` claim | `oidc/<name>`, from the `groups` claim of the ID token |

The [roles](../config/roles.html) in config.yaml then match these values: a role applies when one of its `groups` is one
of the user's groups, or when its `users` holds `<type>/<username>`. Every user also gets the `public` role.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - azuread/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

A user's **profile** page lists the login type, the groups and the roles, which is the quickest way to check a mapping.
The `allowLogin` role option can refuse the login of users that match no role: set it to `false` on `public` and to
`true` on the roles that may sign in.
