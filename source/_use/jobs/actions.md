---
layout: default
title: Job actions
parent: Jobs
nav_order: 3
---

# Job actions
{: .no_toc }

Launch, abort, relaunch, approve or reject, and delete a job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Launch a job

Every job starts from a form. Open it from the **Forms** page, fill in the fields and press **Submit**:

1. The form is validated in the browser, and the field values are posted to the server.
2. The server creates the job and returns its number; the form's [`onSubmit`](../forms/job-status-action.html) actions run.
3. The job's output appears under the form and refreshes every two seconds until the job ends.

The job also appears on the **Jobs** page, where you can follow it later.

### Who can launch a form

A form is listed, and can be launched, for users who have one of the [roles](../config/roles.html) in its `roles` list.
The `public` role, which every user has, makes a form available to everyone who can sign in.

### Before you submit

The bar above the fields offers a few tools, each shown only when your role allows it:

| Button | What it does | Role option |
|---|---|---|
| **Show Extravars** | Previews the extravars the job will receive, as you fill in the fields | `showExtraVars` |
| **verbose** | Runs the job in verbose mode | `allowVerboseMode` |
| **Load from Store** | Fills the fields from a [stored job](stored-jobs.html) | `allowStoredJobs` |
| **Reload this form** | Loads the form again, with its default values | none |

### Choices at launch time

A form can let its users pick some Ansible options when they launch it, by declaring a field with a reserved name. The
value of the field then overrides the form's own setting:

| Field name | Overrides | Typical field type |
|---|---|---|
| `__check__` | Check mode, a dry run that changes nothing | `checkbox` |
| `__diff__` | Diff mode, which shows what would change | `checkbox` |
| `__limit__` | The hosts the playbook runs on | `text` or `enum` |
| `__tags__` | The tags to run | `text` or `enum` |
| `__inventory__` | The inventory | `enum` |
| `__playbook__`, `__template__` | The playbook, or the AWX / AAP template | `enum` |

For example, a form that offers a dry run and a host limit:

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

The server only accepts these names from a form that declares them as fields, so a launch from the API cannot add them on
its own. The properties they override are described with [Ansible forms](../forms/ansible.html) and [AWX forms](../forms/awx.html).

### What can stop a launch

A launch does not always become a running job straight away:

* **Invalid fields** : the form is not submitted, and each field that fails its validation shows why.
* **Launch validation** : with [launch validation](../launch-validation/) set to `enforce`, the server checks the values
  again and refuses a launch that breaks the form's rules.
* **Approval** : a form with an [approval point](../forms/approval.html) creates the job, which then waits in status
  `approve`; see [Approve or reject a job](#approve-or-reject-a-job).

When the job ends, the form's [notifications](../forms/notifications.html) send their mails, and its job status actions run.

### Other ways to start a job

A form can also start a job without a person pressing **Submit**:

| Started by | How | Page |
|---|---|---|
| Run later or a cron schedule | **Run Later (One-time)** or **Schedule (Recurring)** next to **Submit** | [Schedules](schedules.html) |
| A script or a pipeline | `POST /api/v2/job` with an API token | [REST API jobs](../api/jobs.html) |
| An AI agent | The MCP server's `launch_job` tool | [MCP tools](../mcp/tools.html) |
| A conversation | The chat assistant fills in the form and launches it | [Chat assistant](../chat/) |
| An earlier job | **Relaunch**, below | [Relaunch a job](#relaunch-a-job) |

---

## Abort a job

The ban icon in the list, or **Abort job** on the job's page, stops a job with status `running`. After you confirm,
AnsibleForms marks the job for abort:

* **`ansible`**: the playbook process (with all its workers) is stopped, and the job ends as `aborted` with
  `... was aborted by the operator`. In a cluster, the instance that runs the playbook stops it within a few seconds.
* **`awx`**: AnsibleForms asks AWX / AAP to cancel the job or workflow job, and the job ends as `aborted`. When AWX / AAP
  refuses, the output shows `Abort request denied, reverting abort request` and the job keeps running.
* **`multistep`**: the steps that have not started yet are skipped (`skipping: [Abort is requested]`), and the main job
  ends as `aborted`. A step that is already running is a job of its own: open it and abort it to stop it as well.

You can abort your own jobs; an admin can abort any job. `showAllJobLogs` lets a user see other users' jobs, not abort them.

---

## Relaunch a job

The redo icon in the list, or **Relaunch job** on the job's page, starts a new job from a finished one. It is offered on any
job that is neither `running` nor waiting for approval, to users whose role sets the `allowJobRelaunch` role option.

The dialog offers:

* **Relaunch**: runs the job again with the values it ran with, as a new job under your name.
* **Verbose mode**: relaunches in verbose mode; shown with the `allowVerboseMode` role option.
* **Edit values before relaunching**, then **Edit & Relaunch**: opens the form pre-filled with the job's values, so you
  can change them before you submit.

A relaunch also requires the form to allow it (`allowRelaunch`, true by default) and the job to be **your own**, unless
you are an admin or have `showAllJobLogs`. How a relaunch is checked against the form's rules, and why a form with a
password field may refuse it, is described in [Relaunching](../launch-validation/relaunching.html).

### Relaunch with pre-filled data

**Edit & Relaunch** opens the form with the `prefillJobId` URL parameter, which you can also use in a link of your own:

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

The form loads the field values stored with job `61` and shows `Form pre-filled with data from previous job #61`.
Submitting it starts a new job, checked like any other launch. The pre-fill follows the same rules as a relaunch:

* **Password fields are never stored**, so they are never pre-filled: enter them again. Constants are not stored either.
* The `allowJobRelaunch` role option is required, and the job must be your own (or you are an admin or have `showAllJobLogs`).
* A form with `allowRelaunch: false` cannot be relaunched or pre-filled:

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

A job from before the field values were stored cannot be pre-filled, and the form shows an error instead:

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Approve or reject a job

A job with an [approval point](../forms/approval.html) stops in status `approve` and waits. It is visible to every user on
the Jobs page, so the approvers can find it.

The approve and reject icons, or **Approve job** and **Reject job** on the job's page, are shown to admins and to
users who have one of the approval's roles. The dialog shows the approval's title and message, with the job's values
filled in:

* **Approve**: the job continues and its status returns to `running`.
* **Reject**: the job ends as `rejected`, and its output records `rejected by <username>`.

A job waiting for approval cannot be relaunched or deleted from the Jobs page; approve or reject it first.

---

## Delete a job

The trash icon in the list, or **Delete job** on the job's page, deletes a job with its output after you confirm. Deleting
a multistep job deletes its steps too.

You can delete your own jobs. Admins and users with the `showAllJobLogs` role option can delete any job. The button is
hidden while the job is running (except for admins) and while it waits for approval.
