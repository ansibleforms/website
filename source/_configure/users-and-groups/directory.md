---
layout: default
title: Directory users and groups
parent: Users and groups
nav_order: 4
---

# Directory users and groups
{: .no_toc }

LDAP, Entra ID and OIDC users and groups, as last seen
{: .fs-6 .fw-300 }

An LDAP, Entra ID or OIDC user has its page at `/settings/users/<source>/<name>`, with `ldap`, `azuread` or `oidc`
as source, such as `/settings/users/ldap/jdoe`. It shows what was recorded at the user's last sign-in, read only,
since the directory or the identity provider owns who the user is and their groups.

Its tabs are those of a local user. **Details** has the **Allow sign-in** switch, the username, the source, the name,
the email, when the user was first seen and their last sign-in. **Groups** lists the groups of the last sign-in.
**API tokens** lists the user's API tokens, and **Revoke** ends one at once.

At the top right, **End sessions** signs the user out everywhere now. **Forget** removes the record, which comes
back at their next sign-in; their jobs, stored jobs and schedules stay. A blocked user cannot be forgotten, since that
would let them in again: the server answers `409`, so allow their sign-in first.

The groups of this record are also the groups the user's session works with, read live. Forgetting a user who is signed
in leaves them without groups, and without the roles those groups give, until they sign in again.

A directory group has its page at `/settings/groups/<source>/<name>`, read only, with the tabs **Details**,
**Users** (the users seen in it at their last sign-in), **Roles** and **Forms**.
