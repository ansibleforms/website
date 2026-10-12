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

The job holds its `status`, its `extravars` (also as `payload`, the same object), its `subjobs` and its `output`. The
output is HTML with the colors of the job page; add `?text=true` for plain text, which suits a script or a log:

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

Its `status` is `running` while it runs, and `approve` while it waits for an approval. A job ends with one of these:

| Status | Meaning |
|---|---|
| `success` | The job finished without errors |
| `failed` | The job failed |
| `warning` | A multistep job finished, but a step that has `continue` set failed on the way |
| `aborted` | The job was aborted |
| `rejected` | The approval was refused, so what waited for it did not run |
| `abandoned` | The process that followed the job stopped (a restart, a container replaced) and the job was given up |

A job running on a runner when it was abandoned may still end with its real outcome, if that runner finishes it after all.

---

## Find jobs

`GET /api/v2/job` lists the newest jobs first, as `{ "count": ..., "records": [ ... ] }`. These query parameters narrow it:

| Parameter | Meaning |
|---|---|
| `records` | How many jobs, at most. The default is [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), and 5000 the most unless `JOBS_LIST_SIZE` is higher. |
| `user`, `user_type` | Only the jobs of this user. `user_type` is `local` when left out (`ldap`, `azuread`, `oidc` for the others). |
| `runner` | Only the jobs that ran on this runner |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

A user sees their own jobs and the jobs that wait for an approval. An admin, or a role with the `showAllJobLogs` option,
sees every job. A record holds the job's summary (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...); read
the job itself for its extravars and output.

`GET /api/v2/job/approvals` answers with a number: how many jobs wait for an approval the user may give.

---

## More about a job

These endpoints read more of one job:

| Call | What it returns |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | The field values the job was launched with, as the form held them. The same permissions as a relaunch apply: your own job (or every job for an admin), a form that allows relaunch, and the `allowJobRelaunch` role option. |
| `GET /api/v2/job/{id}/node/{nodeId}` | One node of a workflow job: `{ "node", "job", "extravars", "artifacts" }`, where `job` is the ID of the node's own job, or `null` when the node did not run. |

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
