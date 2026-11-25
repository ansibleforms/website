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
| `warning` | The playbook finished but [needs attention](#a-job-that-needs-attention): someone has to follow it up. Or a multistep finished, but a step that has `continue` set failed | Read why on the job's page, follow it up, relaunch, delete |
| `aborted` | The job was aborted from AnsibleForms, or the AWX / AAP job was canceled | View the output, relaunch, delete |
| `rejected` | An approver rejected the job; it never ran | View the output, relaunch, delete |
| `abandoned` | AnsibleForms stopped tracking the job (see [Abandoned jobs](cleanup.html#abandoned-jobs)) | Check the managed hosts, relaunch, delete |

`running` is blue, `success` green and reads **Succeeded**, and `failed` red. `approve` is orange and reads **Waiting for approval**,
so a job waiting for a person stands apart from the stopped ones; `warning` reads **Needs attention**, and it, `aborted` and
`rejected` are amber. `abandoned` is grey: nobody stopped it, what ran it is gone.

---

## A job that needs attention

From 7.8.0 a playbook that finished as designed, but leaves work for an operator (an approval elsewhere, a manual step, a
partial apply), can end its job as **Needs attention** (`warning`) with a message, instead of a `failed` that looks like
broken automation or a `success` that hides what is left. The playbook says so in one of two ways:

* a **status file** next to the playbook, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (or `.yaml`), on an RTE. The RTE
  reads it once the playbook ends, then removes it
* **`set_stats`** with the key `af_job_status`, on an RTE and on AWX, AAP or Ascender

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms passes `__jobid__` in the extravars, so the playbook can build the file's path. The file wins when a playbook
does both.

* Only a playbook that **succeeded** can end as Needs attention: a failed job stays `failed` and an aborted one `aborted`,
  whatever the file says
* A file that is not valid (no message, another status, broken YAML) is ignored: the job stays a success, and its output
  says why in a `[WARNING]` line
* The message shows on the job's page in an amber box, with the detail folded under it as YAML, as the status's tooltip in
  the list, and in the job's last output line. **Needs attention** under **Past** in the jobs menu lists these jobs
* [Notifications](../forms/notifications.html) with `onStatus: [warning]` are sent for them; the mail and the channels carry
  the message, a webhook as [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* In a multistep, a step that needs attention passes and the next step runs; the multistep then needs attention too. In a
  [workflow](../workflows/), the job counts as successful for the next node

Semaphore, Rundeck and Jenkins jobs cannot end as Needs attention.

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
