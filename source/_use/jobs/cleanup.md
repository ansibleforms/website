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

* **At startup**, jobs still `running` or aborting are marked abandoned; the log shows `Abandoned <n> jobs`.
* **Every hour**, jobs that started more than a day ago and are still `running` are marked abandoned.

An abandoned playbook may have run partly. Check the managed hosts before you relaunch it; see
[A job shows the status abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Job retention

Jobs are kept until they are deleted, unless the administrator sets a retention period.

With [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) set, a nightly task (at 2:30) deletes
the finished jobs, with their output and steps, that ended more than that many days ago. It only removes jobs with
status `success`, `failed`, `warning`, `aborted`, `rejected` or `abandoned`, so running jobs and jobs waiting for
approval are kept however old they are. The default, `0`, keeps every job.
