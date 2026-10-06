---
layout: default
title: Relaunching
parent: Launch validation
nav_order: 6
---

# Relaunching
{: .no_toc }

How a relaunched job is validated
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

A job can be relaunched in two ways. How the relaunch is checked depends on which one, and on the launch validation
mode.

## Two kinds of relaunch

The two kinds differ in whether the caller sends new values:

* **As it ran**: the Relaunch button, `POST /api/v2/job/{id}/relaunch` without a body, or `relaunch_job` without
  `values`.
* **With changes**: the same calls with new values, laid over the job's stored field values:

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

## How each is checked

The launch validation mode decides whether a relaunch is replayed or checked again:

| Relaunch | `off` / `log` | `enforce` |
|---|---|---|
| **As it ran** | replays the job's stored extravars, passwords included | the full check, from the stored field values |
| **With changes** | the full check, on the stored values with the changes laid over them | the full check, the same way |

A checked relaunch (see [Log and enforce](log-and-enforce.html)) starts a new job under the caller's name.

## Password fields

Stored field values hold no passwords, so a checked relaunch has none for a **visible password field**:

* The relaunch is refused as `unsupported`, with the `passwordFields` it is missing.
* Launch the form again and enter the password.
* A password field that the form's dependencies **hide** is not needed and does not block the relaunch.

Under `enforce`, this applies to the Relaunch button too.

## Who can relaunch

Both kinds of relaunch require:

* the form to allow relaunch (`allowRelaunch`, true by default);
* the `allowJobRelaunch` role option;
* the user to be **the job's owner**, an admin, or a user who sees every job (`showAllJobLogs`).

Approvers can see a job that waits for their approval, but cannot relaunch it.
