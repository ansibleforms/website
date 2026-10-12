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

AnsibleForms sets the following statuses on a job. The list shows each status as a colored pill:

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

`running` is blue, `success` green and `failed` red. `approve` is orange and reads **Needs approval**, so a job waiting for
a person stands apart from the stopped ones; `warning`, `aborted`, `rejected` and `abandoned` are amber.

---

## Job types

The job type follows the `type` of the form that started the job, as the list and the job's page show it:

| Type shown | What runs |
|---|---|
| `ansible` | An Ansible playbook, run on an RTE |
| `awx`, `aap`, `ascender` | A job template or workflow template on AWX, AAP or Ascender |
| `semaphore` | A template on Semaphore UI |
| `rundeck`, `jenkins` | A job on Rundeck or Jenkins |
| `workflow` | A [workflow](../workflows/), whose playbook nodes run as jobs of their own under it |
| `multistep` | Deprecated, use `workflow`: a sequence of steps, each recorded as a job of its own under the main job |

A template job is stored as an `awx` job (in the REST API too) and shown with the kind of runner it ran on, whatever the
form called it: a form of type `awx` that runs on an AAP runner shows `aap`.

See [Ansible forms](../forms/ansible.html), [AWX forms](../forms/awx.html), [Workflow forms](../forms/workflow.html) and
[Multistep forms](../forms/multistep.html) for the form side.
