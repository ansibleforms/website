---
layout: default
title: Runners
nav_order: 11
has_children: true
has_toc: false
permalink: /runners.html
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

## In this section

| Page | What it covers |
|---|---|
| [The runners page](runners/list.html) | The list of runners, adding one, and the default of each type |
| [Runner types](runners/types.html) | The products a runner can be, their address and login |
| [Registration](runners/registration.html) | How an RTE adds itself, with a join token or on its own, and when it is removed |
| [A runner's page](runners/runner-page.html) | A runner's tabs, an RTE's mode and socket, and Test connection |
| [Who manages runners](runners/permissions.html) | Who may add, change and test runners |


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

A `workflow` or `subform` form has no runner of its own: each node of a [workflow](workflows/) picks its own. A node
with a `runner:` runs on that runner (an RTE, or a template or job on AWX, Semaphore, Rundeck or Jenkins), any other on
the default RTE, so the nodes of one job can run on different runners. The `multistep` form, deprecated since 7 and
replaced by workflows, works the same way: each of its steps runs on the runner its own type needs.

A form picks its runner in one of two ways:

- **By name**: `runner: <name>` on the form, on a workflow node, or on a step of a deprecated multistep (also in the
  designer's form settings). The runner must be of the type the form needs, or the job fails. The older `awx: <name>`
  still works, logs a deprecation warning, and goes away in 8.
- **As the default**: a form that names no runner runs on the default runner of its type. Without one, the job fails
  with a message that says which type of runner to add.

