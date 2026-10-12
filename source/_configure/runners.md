---
layout: default
title: Runners
nav_order: 4.5
---

# Runners
{: .no_toc }

Where jobs run: runtime environment containers for playbooks, and AWX, AAP, Ascender, Semaphore, Rundeck or Jenkins for templates
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: add the runners your forms run their jobs on, choose the default of each type and test them.

---

## How it works

Since version 7 the app runs nothing itself: every job runs on a **runner**, added under **Connections > Runners**.
A form's type decides which type of runner it needs:

| Form type | Runs on a runner of type | What runs |
|---|---|---|
| `ansible` | RTE | A playbook, in a runtime environment container |
| `awx`, `aap`, `ascender` | AWX (the flavours AWX, AAP and Ascender) | A job or workflow template |
| `semaphore` | Semaphore | A Semaphore UI template |
| `rundeck` | Rundeck | A Rundeck job |
| `jenkins` | Jenkins | A Jenkins job |

A `multistep`, `workflow` or `subform` form has no runner of its own: each step of a multistep runs on the runner its own
type needs, so the steps of one job can run on different runners.

A form picks its runner in one of two ways:

- **By name**: `runner: <name>` on the form or on a step (also in the designer's form settings). The runner must be
  of the type the form needs, or the job fails. The older `awx: <name>` still works, logs a deprecation warning, and
  goes away in 8.
- **As the default**: a form that names no runner runs on the default runner of its type. Without one, the job fails
  with a message that says which type of runner to add.

---

## The runners page

The page under **Connections > Runners** lists every runner with these columns:

| Column | Meaning |
|---|---|
| Default | Whether it is the default runner of its type. |
| Name | How forms refer to it, with `runner: <name>`. |
| Registration | How it was added; see [Registration](#registration). |
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

---

## Runner types

The **Type** step offers one choice per product. AAP and Ascender are stored as a runner of type `awx` with a flavour
(`aap` or `ascender`), which is also what the config seed uses:

| Type | Uri example | Project | Authentication |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | The `RTE_TOKEN` of the RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | An API token, or a user and password |
| Ascender | `https://ascender.example.com/api/v2` | | An API token, or a user and password |
| AWX | `https://awx.example.com/api/v2` | | An API token, or a user and password |
| Jenkins | `https://jenkins.example.com` | The folder the jobs are in (optional) | A user and that user's API token |
| Rundeck | `https://rundeck.example.com` | The project name | A user's API token |
| Semaphore | `https://semaphore.example.com` | The project id, the number in `/project/<id>` | A user's API token |

An AWX, AAP or Ascender address carries its API path: `/api/v2`, or `/api/controller/v2` for AAP 2.5 and later.
An RTE is the AnsibleForms image started with `AF_ROLE=rte`; how to run one is described in
[Scaling](production/scaling.html).

---

## Registration

The **Registration** column says how a runner got onto the page:

| Registration | Meaning |
|---|---|
| automatic | An RTE added itself when it started, and it is still answering. |
| unresponsive | An RTE that added itself has not answered for two minutes. Once it has been silent for ten minutes, the runner is removed. |
| manual | Added on this page or by the config seed. It is never removed automatically. |

An RTE registers itself by default, at its `RTE_URL` or else at its own address and port. To manage RTE runners
yourself, start the RTE with `RTE_REGISTER=0` and add it here with type RTE, its address and the same token.

---

## A runner's page

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

---

## Who manages runners

A runner receives the credentials of every job it runs, so only the **admin** role adds, changes or deletes runners.
Users with settings access see them and can test them, but cannot change them.

A runner declared in the [config seed](seed/) is read only on this page: change it in the seed file instead.
