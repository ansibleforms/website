---
layout: default
title: Users and groups
nav_order: 3.2
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

## The lists

The **Users** and **Groups** lists show the local users and groups and, beside them, the LDAP and single sign-on ones.

A user or group of LDAP, Entra ID or OIDC is listed once it has signed in (or has been seen in a sign-in), or once a role names it.
The **Source** column says where each comes from: Local, LDAP, Entra ID or OIDC.

A row opens the page of its user or group. **Add user** and **Add group** create a local one.

---

## A local user

**Add user** opens a wizard in three steps: **User** (username, description, email), **Password** and **Group**.

A user's page, `/settings/users/<id>`, has these tabs:

| Tab | What it shows |
|---|---|
| **Details** | The **Allow sign-in** switch, the username, the description and the email |
| **Groups** | The groups the user belongs to |
| **Roles** | The roles the user has, and what gives each: **Directly**, **Through** a group, or **Everyone** |
| **Forms** | The forms those roles open |
| **Jobs** | The jobs the user launched, the latest first |
| **Stored jobs** | The form values the user stored to run again |
| **Schedules** | The jobs the user planned with Run later |
| **Activity** | What the audit log recorded the user doing |

**Change password** and **Delete** are at the top right. The user `admin` can never be deleted or renamed.

---

## Several groups

A local user can belong to several groups, and gets the roles of every one of them: roles name a group as `local/<group>`.

On the **Groups** tab, **Add group** adds the user to another group, and a row's menu or the checkboxes remove one.
A user keeps at least one group. The users list has **Add to group** in each row's menu for the same.

---

## A local group

A group's page, `/settings/groups/<id>`, has these tabs:

| Tab | What it shows |
|---|---|
| **Details** | The name and the description |
| **Users** | The users in the group; **Add user** adds one, a row's menu or the checkboxes remove one |
| **Roles** | The roles that name the group |
| **Forms** | The forms those roles open |

A group with users cannot be deleted: remove its users first. The `admins` group can never be deleted or renamed.

---

## Directory users and groups

An LDAP, Entra ID or OIDC user has its page at `/settings/users/<source>/<name>`, with `ldap`, `azuread` or `oidc`
as source, such as `/settings/users/ldap/jdoe`. It shows what was recorded at the user's last sign-in, read only,
since the directory or the identity provider owns who the user is and their groups.

Its tabs are those of a local user. **Details** has the **Allow sign-in** switch, the username, the source, the name,
the email, when the user was first seen and their last sign-in. **Groups** lists the groups of the last sign-in.

At the top right, **End sessions** signs the user out everywhere now. **Forget** removes the record, which comes
back at their next sign-in; their jobs, stored jobs and schedules stay.

A directory group has its page at `/settings/groups/<source>/<name>`, read only, with the tabs **Details**,
**Users** (the users seen in it at their last sign-in), **Roles** and **Forms**.

---

## Blocking a sign-in

The **Allow sign-in** switch blocks a user, local or from a directory, without deleting anything.

Switched off, after a confirmation, the user's sessions end at once and every sign-in is refused until you switch it on again.
The users list has **Block sign-in** and **Allow sign-in** in each row's menu for the same.

You cannot block the user `admin`, nor your own sign-in.
