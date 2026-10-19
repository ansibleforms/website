---
layout: default
title: Users and groups
nav_order: 15
has_children: true
has_toc: false
permalink: /users-and-groups.html
---

# Users and groups
{: .no_toc }

The local users and groups, the LDAP and single sign-on ones beside them, and blocking a sign-in
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: manage who may sign in under **Settings > Access > Users** and **Groups**, with the `showSettings` role option.

The built-in admin, the login order and the role mapping of local accounts are on [Local accounts](authentication/local.html).

---

## In this section

| Page | What it covers |
|---|---|
| [A local user](users-and-groups/local-user.html) | Adding a local user, and its page's tabs |
| [Several groups](users-and-groups/several-groups.html) | A local user in several groups, and their roles |
| [A local group](users-and-groups/local-group.html) | A local group's page and its tabs |
| [Directory users and groups](users-and-groups/directory.html) | LDAP, Entra ID and OIDC users and groups, as last seen |
| [Blocking a sign-in](users-and-groups/blocking-a-sign-in.html) | Allow sign-in: block a user without deleting anything |


---

## The lists

The **Users** and **Groups** lists show the local users and groups and, beside them, the LDAP and single sign-on ones.

A user or group of LDAP, Entra ID or OIDC is listed once it has signed in (or has been seen in a sign-in), or once a role names it.
The **Source** column says where each comes from: Local, LDAP, Microsoft Entra ID or OIDC. From 7.3.0 the **Users** list also
has a **Last sign-in** column, which says when each user last signed in.

A row opens the page of its user or group. **Add user** and **Add group** create a local one.

---

## Accounts that grant admin

The admin role in config.yaml names local groups and users, so only an admin may change the accounts and groups it names.

A user with `showSettings` but without the admin role cannot change, block, re-group, set the password of or delete a
local account the admin role names (by itself or through one of its groups). Nor can they create, rename or delete a group
the admin role names, or put a user into one. The same holds for an LDAP or SSO user who maps to the admin role: blocking
it, ending its sessions, forgetting it and revoking its API tokens are an admin's. The server answers such a request `403`.

