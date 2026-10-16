---
layout: default
title: The runners page
parent: Runners
nav_order: 1
---

# The runners page
{: .no_toc }

The list of runners, adding one, and the default of each type
{: .fs-6 .fw-300 }

The page under **Connections > Runners** lists every runner with these columns:

| Column | Meaning |
|---|---|
| Default | Whether it is the default runner of its type. |
| Name | How forms refer to it, with `runner: <name>`. |
| Registration | How it was added; see [Registration](registration.html). |
| Type | Runtime environment (RTE), AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck or Jenkins. |
| Uri | Its address. |

**Add runner** opens a dialog in four steps: **Runner** (name and description), **Type**, **Connection** and
**Authentication**. A row opens the runner's own page, and its menu offers **Edit runner**, **Test connection**,
**Change authentication** and **Delete runner**.

**Edit defaults** opens a dialog with the default runner of each type:

| Group | Where these forms run when they name no runner |
|---|---|
| Playbook forms | `ansible` forms, on an RTE |
| AWX, AAP and Ascender forms | `awx`, `aap` and `ascender` forms, on an AWX runner |
| Semaphore forms | `semaphore` forms |
| Rundeck forms | `rundeck` forms |
| Jenkins forms | `jenkins` forms |

The first runner of a type becomes its default, so a single runner per type needs no extra step.
