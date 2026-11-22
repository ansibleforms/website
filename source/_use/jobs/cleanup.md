---
layout: default
title: Cleanup
parent: Jobs
nav_order: 6
---

# Cleanup
{: .no_toc }

Jobs cut off by a restart, and how long finished jobs are kept
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Abandoned jobs

A running job is tracked by the AnsibleForms process that started it. When that tracking stops, the job is marked
`abandoned`:

* **At startup**, the jobs that this process followed before it restarted, and the jobs from before 7 that no process
  follows, are marked abandoned if they are still `running` or aborting; the log shows `Abandoned <n> jobs`. A job that
  runs on an RTE is not touched: it carries on without the process that started it.
* **Every minute**, the [system task](system-tasks.html) **Stopped nodes** marks abandoned the jobs followed by another
  AnsibleForms process (or RTE) that stopped answering for 2 minutes; the log shows `Abandoned <n> jobs followed by a node that stopped answering`.
* **Every hour**, the system task **Abandoned jobs** marks abandoned the jobs that started more than a day ago, are still
  `running` and wrote no output for a day. A job that runs on an RTE is left alone here too: the RTE cleans up its own jobs when it restarts.

From 7.3.0 a template job on AWX, AAP or Ascender that a restart or a stopped node abandoned is picked up again, if it started
within the last 24 hours: one AnsibleForms process takes it over, follows it on the runner again, and the job ends with what
really happened there. Jobs on the other runners, playbooks, workflows and multistep jobs stay abandoned.

An abandoned playbook may have run partly. Check the managed hosts before you relaunch it; see
[A job shows the status abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Job retention

Finished jobs are kept for as many days as the administrator sets in [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS).

The nightly system task **Job cleanup** (at 2:30) deletes the finished jobs, with their output and steps, that ended more than
that many days ago. It only removes jobs with status `success`, `failed`, `warning`, `aborted`, `rejected` or `abandoned`, so
running jobs and jobs waiting for approval are kept however old they are. The default is `90` since 7.6.0 (`0` before), and `0`
keeps every job.

These times are the defaults: from 7.8.0 an admin changes them on the task's page, under **Jobs > System**, and sees each of its
runs there (see [System tasks](system-tasks.html)).
