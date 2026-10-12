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

Multistep jobs show the current step's output beside the main job; AWX/AAP workflows also show their nodes' status.
[Workflow](../workflows/running.html#the-job) jobs draw their graph, live, and a click on a node opens its output.
