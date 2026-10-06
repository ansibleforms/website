---
layout: default
title: Jobs
parent: REST API
nav_order: 2
---

# Jobs
{: .no_toc }

Launch a form, follow the job, abort, relaunch or approve it
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

A job is one run of a form. Launch it with the form's name and values, then follow it by its ID.

---

## Launch a form

Send the form name and its values to `POST /api/v2/job`:

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

The request takes these properties:

| Property | Meaning |
|---|---|
| `formName` | The name of the form to launch. Required. |
| `extravars` | The extra variables for the job. |
| `rawFormData` | The values of the form's fields, as the browser holds them. [Launch validation](../launch-validation/) checks these, and builds the extravars from them. |
| `credentials` | Credentials to pass to the job, by name. |
| `files` | The uploads of the form's file fields (see [File uploads](../launch-validation/file-uploads.html)). |

The response holds the new job's ID:

```json
{ "id": 42 }
```

---

## Follow the job

Read the job by its ID:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

Its `status` is `running` until it ends as `success`, `failed` or `aborted`. A job that waits for an approval is
`approve`, and one that was refused is `rejected`.

---

## Other actions

These endpoints act on an existing job:

| Call | Action |
|---|---|
| `POST /api/v2/job/{id}/abort` | Abort a running job |
| `POST /api/v2/job/{id}/relaunch` | Relaunch a job, as it ran or with changes (see [Relaunching](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Approve a job that waits for approval |
| `POST /api/v2/job/{id}/reject` | Reject a job that waits for approval |
| `GET /api/v2/job/{id}/download` | Download the job's output |
| `DELETE /api/v2/job/{id}` | Delete a job |
