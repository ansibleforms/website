---
layout: default
title: Running a workflow
parent: Workflows
nav_order: 3
---

# Running a workflow
{: .no_toc }

Launch a workflow from a form, and follow it on the jobs page
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The form

A form of [type `workflow`](../forms/workflow.html) launches a workflow, named with `workflow:` as a playbook is: by
its **file** in the workflows folder, with its subfolders (`team/deploy-app.yml`), or by the workflow's **name** inside
the file (`deploy-app`):

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

The form's fields reach every node as extra vars, and so do its [`credentials`](../forms/workflow.html#workflow_credentials), under the names
the form gives them, as a multistep form's reach its steps:

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

A node's own credentials, set in the workflow file, reach its playbook under their own name and win a name both use. In the designer's Visual tab of a form, **Workflow** is a list of the
designer's workflow files.

A file name alone is found in a subfolder too, when only one file has it. Two workflows of one name stop a form that names
it by its name, and the designer warns when you save the second: rename one, or name its file. A workflow that cannot be
found ends the job failed, with the reason in its output.

---

## The job

A workflow job runs on the AnsibleForms server, and each playbook node runs as a job of its own, a child of the workflow
job as a multistep form's steps are: a designer playbook on the RTE, or, for a node with a `runner:`, that runner's
template or job on AWX, AAP, Ascender, Semaphore, Rundeck or Jenkins (see [Where a node runs](designer.html#where-a-node-runs)).

The job's page draws the workflow, live: each node coloured by its status, the links that fired, and the nodes that will
not run. The facts at the top name the workflow in place of a playbook.

- **Click a node** that finished to open its output in a dialog.
- **The output** holds every node's output under a `WORKFLOW NODE [identifier] (status)` banner, in the order the nodes
  finished.
- **Show extravars** and **Show artifacts**, on each node's header in the output and in the dialog opened from the graph,
  show that node's own extravars and artifacts (`{}` when it has none), as JSON or YAML, with a Copy button.

A node's extravars hold what the nodes before it passed on, and its artifacts what its playbook gathered with
`set_stats`. The two buttons follow the [role options](../config/roles.html#role-options) `showExtravars` and
`showArtifacts`. The same data comes from `GET /api/v2/job/{id}/node/{nodeId}`, for anyone who may see the job.

The job fails when a node failed and nothing handled it, by AWX's rule; otherwise it succeeds.

---

## Approvals

An approval node holds the workflow job until someone answers it.

When the workflow reaches an approval node, the job's status turns to **Needs approval**: it shows in the bell and on the
job's page, as a form's [approval point](../forms/approval.html), and the users the form's `approval` names can approve or
reject it. The form's approval notifications are sent as well.

- **Approved**, the node succeeds and the workflow goes on along its *on success* links.
- **Rejected**, the node fails and the workflow goes on along its *on failure* links.
- **Timed out**, after the node's timeout with no answer, the node fails as well.

---

## Abort

**Abort** on a running workflow job stops it: the running node jobs are aborted, nothing more starts, and an approval it
waits on is canceled. A workflow job waiting on an approval can be aborted too.
