---
layout: default
title: A local group
parent: Users and groups
nav_order: 3
---

# A local group
{: .no_toc }

A local group's page and its tabs
{: .fs-6 .fw-300 }

Since 7.8.0, **Add group** opens the **New group** wizard in three steps: **Details** (the name and the description), **Users** (the
local users to put in the group) and **Roles** (the roles to give it, so its users have them). Only the name is required. **Save**, on the
last step, creates the group, then adds the users and gives the roles: one that fails is named in a message, and the group stays.

A group's page, `/settings/groups/<id>`, has these tabs:

| Tab | What it shows |
|---|---|
| **Details** | The name and the description |
| **Users** | The users in the group; **Add user** adds one, a row's menu or the checkboxes remove one |
| **Roles** | The roles that name the group |
| **Forms** | The forms those roles open |

A group with users cannot be deleted: remove its users first. The `admins` group can never be deleted or renamed.
