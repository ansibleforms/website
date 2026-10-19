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

**Add user** opens a wizard in three steps: **User** (username, description, email), **Password** and **Group**.

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
