---
layout: default
title: Following a job
parent: Jobs
nav_order: 2
---

# Following a job
{: .no_toc }

Live output, extravars, filters and downloads
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Follow a job

Clicking a job opens its page: the job's form as the title, its actions in the header and its output below.

![The output of a job](../assets/screenshots/job-output.jpg)

The page updates live: the server sends an event each time a job is launched, changes status, writes output or is
deleted, and the page reads the job again, so the output grows as the job writes it. The jobs list updates the same way.
**Refresh** reloads the job by hand.

While you are at the end of the output, the page follows it down as new lines come in. Scroll up to read an earlier line
and it stays where you are: **Jump to latest** then shows over the bottom of the output, and turns to **New lines** once
more came in. Click it, or scroll back down to the end, to follow the new lines again. The output on the form's page, after
**Submit**, and the [server log](../production/logs.html) follow their new lines the same way.

The output toolbar has:

| Button | What it does |
|---|---|
| **Show Extravars** | Shows the extravars the job ran with, as JSON or YAML (**View as YAML**), with a copy icon |
| **Show Artifacts** | Shows the job's artifacts, as JSON or YAML (see below) |
| **Hosts and tasks** | Shows a playbook's hosts and tasks over its output (see [Hosts and tasks](#hosts-and-tasks)) |
| **Refresh** | Reloads the output |
| **Apply filter** | Hides the tasks whose name matches the output filter; **Remove filter** shows them again |
| **Copy Output** | Copies the output as plain text, with the filter applied or not |
| **Download Output** | Downloads the output as `ansibleforms-job-<id>.txt` |

**Show Artifacts** is offered for a template job that ran on AWX, AAP or Ascender, and for a playbook on the RTE or a
workflow whose playbooks gathered artifacts with `set_stats`. Semaphore, Rundeck and Jenkins jobs have no artifacts, so it
is never offered for them.

**Show Extravars** requires the `showExtravars` role option and **Show Artifacts** the `showArtifacts` role option (see
[role options](../config/roles.html#role-options)). Values of password fields and keys matching
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) are masked.

The filter is set by [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT), `\[low\]` by
default. Put `[low]` in the name of a noisy task, and **Apply filter** hides that task and its lines.

A multistep job's page shows every step under the main job, one under the other, each under a title bar such as
**Step 1 · Prepare the server (jobid 98)** with its status. Click a title (or press Enter or Space on it) to fold that output
away, and again to unfold it. AWX/AAP workflows also show their nodes' status.

[Workflow](../workflows/running.html#the-job) jobs keep every node's output in their own, under a `WORKFLOW NODE` banner per
node; they draw their graph, live, and a click on a node opens its output.

---

## Hosts and tasks

Since 7.3.0, a playbook job that ran on an RTE of 7.3.0 or later records its structured events next to its text output: each play, task
and host result, and the recap. **Hosts and tasks**, in the output toolbar, shows them in a panel over the output, on the job's page and
under a form after **Submit**. It is offered once the job has events, and the panel is read again every few seconds while the job runs:

| View | What it shows |
|---|---|
| **Grid** | The recap per host (ok, changed, failed, unreachable, skipped, rescued, ignored), then a grid of hosts by tasks: each cell is coloured by the host's result for that task, with its message and time on hover, or *not run* |
| **Timeline** | Each task as a bar, as long as its slowest host took, with its time in seconds and the total |

The text output stays as it is. The events are written by the RTE's own `af_events` callback plugin, so the playbook needs no change.
