---
layout: default
title: The runners page
parent: Runners
nav_order: 1
---

# The runners page
{: .no_toc }

The list of runners, adding one, turning one on or off, and the default of each type
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The list

The page under **Connections > Runners** lists every runner with these columns:

| Column | Meaning |
|---|---|
| Default | Whether it is the default runner of its type. |
| Enabled | Whether it takes jobs. A runner turned off gets no job, even as the default of its type. |
| Name | How forms refer to it, with `runner: <name>`. An RTE that asked to join shows **Waiting for approval** next to it. |
| Type | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck or Jenkins. |
| Description | What it is for. |

**Columns** adds two more, off by default: **Mode**, an RTE's mode (Outbound, Inbound or Database (deprecated), see
[Modes](../rte/modes.html)), and **Connection**, whether an app node holds a socket to an RTE in a socket mode: **Connected** or
**Not connected**.

**Add runner** opens a dialog in three steps: **Runner** (name and description), **Type** (for an RTE also its **Mode**) and
**Credentials**. In the **Type** step each product has a hint: the RTE's gives its full name, *Runtime Environment*. A row opens the
runner's own page, and its menu offers:

| Action | What it does |
|---|---|
| Edit runner | Opens its page |
| Test connection | Checks that it answers and accepts its credential |
| Approve, Reject | Only for an RTE waiting for approval: see [Approving an RTE](registration.html#approving-an-rte) |
| Enable, Disable | Turns it on or off, whichever it is not |
| Change credentials | Opens the Credentials tab of its page |
| Delete runner | Removes it |

---

## Default and Enabled

The default of each type is where the forms of that type run when they name no runner:

| Default for | Where these forms run when they name no runner |
|---|---|
| Playbook forms | `ansible` forms, on an RTE |
| AWX, AAP and Ascender forms | `awx`, `aap` and `ascender` forms, on an AWX runner |
| Semaphore forms | `semaphore` forms |
| Rundeck forms | `rundeck` forms |
| Jenkins forms | `jenkins` forms |

The first runner of a type becomes its default, so a single runner per type needs no extra step. To make another runner the default,
turn on the **Default** switch on its page (see [A runner's page](runner-page.html)).

A runner turned off stays listed with its settings, but no job goes to it, its type's default included. A job for it fails with
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Turn it on or off with **Enable** or **Disable** in its row's menu, or with the **Enabled** switch on its page. A new runner is on, and the
runners that existed before 7.3.0 are on after the upgrade. The [config seed](../seed/example.html) can turn one off with
`enabled: false`.
