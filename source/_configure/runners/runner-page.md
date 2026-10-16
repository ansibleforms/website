---
layout: default
title: "A runner's page"
parent: Runners
nav_order: 4
---

# A runner's page
{: .no_toc }

A runner's tabs, Test connection, and its token
{: .fs-6 .fw-300 }

A runner's page shows the steps of its dialog as tabs, plus what runs on it:

| Tab | What it holds |
|---|---|
| Details | The registration, name and description, and the **Default** switch. Turning it on makes the runner the default of its type; it is turned off by making another runner the default. |
| Type | The product, as in the dialog. |
| Connection | **Uri**, **Project** (Semaphore, Rundeck, Jenkins), **Skip certificate verification**, and **Use a custom CA certificate** with its **CA bundle**. |
| Authentication | Token, or **User and password** for AWX, AAP and Ascender; the **Username** for Jenkins. |
| Forms | The forms that run on it, and how: **Names it** or **As the default runner**. A row opens the form. |
| Jobs | The latest 100 jobs that ran on it, with their status, start, end and duration. A row opens the job. |

Next to **Save**, top right, are **Test connection**, **Change token** (or **Change password** with a user and
password) and **Delete**. A token or password is never shown again once saved: change it with that button.

**Test connection** checks that the runner answers and accepts its token or login. For an RTE it also shows its
release and its Ansible version, and refuses an RTE that needs to be updated to work with this app.
