---
layout: default
title: Permissions
parent: Your profile
nav_order: 4
---

# Permissions
{: .no_toc }

What your roles allow you to do
{: .fs-6 .fw-300 }

---

The role options are grouped in tabs, each with how many of its options you have, such as `5/8`:

| Tab | Options about |
|---|---|
| **Access and integrations** | Signing in, the chat assistant, the MCP server, file uploads and API tokens |
| **Designer** | Opening the designer, and editing forms, playbooks, workflows, inventories and vars files |
| **Jobs** | Seeing jobs and their extravars or artifacts, relaunching, deleting, scheduling and storing jobs |
| **Settings** | The settings pages, the logs, the audit log and backups |
| **Other** | An option set in a role by hand that is in no other tab; always the last tab |

The other tabs are in alphabetical order. Each tab is a table with the columns **Setting** (the option), **Description**
(what it does) and **Your access**: **Allowed** or **Not allowed**. An option that applies because of another one says so
under its description: **Included in** an option you have turns it on, and **Needs** an option you lack keeps it off.

Options come from the `options` of your roles in `config.yaml`; the [Roles](../config/roles.html) page explains how
they combine.
