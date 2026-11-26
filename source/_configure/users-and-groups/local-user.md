---
layout: default
title: A local user
parent: Users and groups
nav_order: 1
---

# A local user
{: .no_toc }

Adding a local user, and its page's tabs
{: .fs-6 .fw-300 }

**Add user** opens the **New user** wizard in four steps:

| Step | What it asks |
|---|---|
| **User** | The username, the description and the email; only the username is required |
| **Password** | The password, typed twice: **Next** waits until both are the same |
| **Group** | The local group the user belongs to, and that gives it the group's roles |
| **Roles** | The roles given to the user itself, each picked with **Add role**; none is needed |

The **Roles** step and the password typed twice are new in 7.8.0. **Save**, on the last step, creates the user and then gives it the
roles picked: a role it could not be given is named in a message, and the user is created all the same.

A user's page, `/settings/users/<id>`, has these tabs:

| Tab | What it shows |
|---|---|
| **Details** | The **Allow sign-in** switch, the username, the description, the email and, from 7.3.0, the **Last sign-in** |
| **Groups** | The groups the user belongs to |
| **Roles** | The roles the user has, and what gives each: **Directly**, **Through** a group, or **Everyone** |
| **Forms** | The forms those roles open |
| **Jobs** | The jobs the user launched, the latest first |
| **Stored jobs** | The form values the user stored to run again |
| **Schedules** | The jobs the user planned with Run later |
| **Activity** | What the audit log recorded the user doing |
| **API tokens** | The user's API tokens, with when each was created, expires and was last used; **Revoke** ends one at once |

From 7.3.0 a local user's sign-ins are recorded, as an LDAP or SSO user's already were: **Last sign-in** shows the latest, and
the users list has a sortable **Last sign-in** column for every source, so an account nobody uses stands out. A refused sign-in is not
recorded, and a local user who has not signed in since the upgrade shows `–`.

**Change password** and **Delete** are at the top right. The user `admin` can never be deleted or renamed.
