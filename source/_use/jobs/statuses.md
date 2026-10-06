---
layout: default
title: Statuses and types
parent: Jobs
nav_order: 1
---

# Statuses and types
{: .no_toc }

Every status a job can have, and the kinds of job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Job statuses

AnsibleForms sets the following statuses on a job. The list shows the status as it is stored, and colors the row by it:

| Status | Meaning | What you can do |
|---|---|---|
| `running` | The job is running, or an approved job has resumed | Follow its output, abort it |
| `approve` | The job waits at an [approval point](../forms/approval.html) before it runs (or before a step of a multistep runs) | Approve or reject it, if one of your roles is an approver |
| `success` | The playbook, template or every step finished without errors | View the output, relaunch, delete |
| `failed` | The job ended with an error, or the launch itself failed | View the output to see why, relaunch, delete |
| `warning` | A multistep finished, but a step that has `continue` set failed | View the output, relaunch, delete |
| `aborted` | The job was aborted from AnsibleForms, or the AWX / AAP job was canceled | View the output, relaunch, delete |
| `rejected` | An approver rejected the job; it never ran | View the output, relaunch, delete |
| `abandoned` | AnsibleForms stopped tracking the job (see [Abandoned jobs](cleanup.html#abandoned-jobs)) | Check the managed hosts, relaunch, delete |

`running` rows are blue, `success` green and `failed` red; the other statuses are shown in amber.

---

## Job types

The job type is the `type` of the form that started the job:

| Job type | What runs |
|---|---|
| `ansible` | An Ansible playbook, run by AnsibleForms itself |
| `awx` | A job template or workflow template on AWX / AAP |
| `multistep` | A sequence of steps, each recorded as a job of its own type (`ansible` or `awx`) under the main job |

See [Ansible forms](../forms/ansible.html), [AWX forms](../forms/awx.html) and [Multistep forms](../forms/multistep.html) for the form side.
