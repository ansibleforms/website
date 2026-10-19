---
layout: default
title: Tools
parent: MCP server
nav_order: 2
---

# Tools
{: .no_toc }

The tools an agent uses to fill in, approve and relaunch forms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

The MCP server offers up to 15 tools. Six are offered to every user; the others follow the user's role options, so a user
without an option is not offered its tools at all:

| Tool | What it does | Offered with |
|---|---|---|
| `list_forms` | The forms the user may use: name, description, categories, and `enableForChat` (whether the chat assistant offers it). | always |
| `get_form` | One form's full definition. Each field also carries `dynamic` (evaluated from an expression or query) and `dependsOn` (the fields it reads). | always |
| `resolve_field` | Evaluates the form for the values filled in so far. See below. | always |
| `launch_job` | Launches the form with the given values, exactly as a browser submission would. Returns the job id. | always |
| `relaunch_job` | Launches a job again with some fields changed. See below. | always |
| `get_job` | Status and output of a job (`tail` limits the output to the last lines). | always |
| `plan_job` | Runs the form once, later, as the user: what **Run later (one-time)** does on the form. | `allowPlannedJobs` |
| `create_schedule` | Creates a schedule, recurring (`cron`) or one-time (`run_at`), as on the **Schedules** page. | `allowScheduledJobs` |
| `list_schedules` | The schedules the user may see: all of them with `allowScheduledJobs`, else the runs they planned. | `allowPlannedJobs` or `allowScheduledJobs` |
| `get_schedule` | One schedule, with its extra vars (secret-looking ones masked) and the output of its last run. | `allowPlannedJobs` or `allowScheduledJobs` |
| `delete_schedule` | Cancels a planned run or deletes a schedule the user may see. | `allowPlannedJobs` or `allowScheduledJobs` |
| `list_stored_jobs` | The [stored jobs](../jobs/stored-jobs.html) the user may see, without their values. | `allowStoredJobs` |
| `get_stored_job` | One stored job with its values, by `id`, or by `form` and `name` among the user's own. | `allowStoredJobs` |
| `store_job` | Saves values of a form under a name, as **Store** on the form does. | `allowStoredJobs` |
| `delete_stored_job` | Deletes a stored job the user may see. | `allowStoredJobs` |

`launch_job`, `relaunch_job` and `plan_job` take `verbose: true` to run the job in verbose mode, which needs the
`allowVerboseMode` role option. With [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) the tools that launch, plan or
change (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` and `delete_stored_job`)
are not offered.

There is no tool to run an arbitrary expression, query, playbook or extravars. Expressions
and queries only ever run as the form defines them.

The [Chat assistant](../chat) uses these tools too, with a **Launch** button in place of `launch_job`.

---

## Filling in a form

Call `resolve_field` with the form name and the values you have so far, and again after every answer. It works through
the fields in dependency order and reports for each one:

- `status`: `resolved`, `waiting` (with `waitingFor`), `hidden`, or `error` (the field falls back to its default);
- `value`, `default` and, for choice fields, `options` (at most `maxOptions`, default 200);
- `needsInput`: a required field without a value, or a choice still on `__auto__`;
- `validationErrors`: the rules the value breaks, as `[{type, description}]`, with the browser's message.

For the whole form, `missing` and `invalid` list what still needs fixing; `launch_job` refuses it until `complete` is true.

Validation is the browser's own code, shared with [launch validation](../launch-validation). Hidden fields are not
validated, and an empty optional field is valid.

---

## Schedules and planned runs

`plan_job` takes the same `form`, `values` and `expectedPayloadHash` as `launch_job`, with a `name` for the run and `run_at`, an
ISO 8601 time with its offset or `Z` (`2026-10-15T22:00:00+02:00`); a time without a zone is refused. The values are resolved
and validated now, and checked again when the run fires, as for a [planned run](../jobs/schedules.html#planned-runs) in the
browser. The answer gives the run time in UTC and on the app's clock.

`create_schedule` takes a `form`, a `name`, either `cron` (five fields, such as `0 22 * * 1-5`) or `run_at`, and the
`extraVars` the job gets. Such a schedule runs as the `Schedule Service`, without the form's validation; to run a form once as
the user, use `plan_job`. Schedule names are unique.

---

## Stored jobs

A stored job is a form's values saved under a name; the tools work on the same stored jobs as the browser.

`list_stored_jobs` lists the user's own stored jobs, or everyone's for a user with `showSettings`, with their name, description,
form, creation and expiry. One marked `usable` (the user's own, of a form they may launch) can be passed as `storedJob`
(`{ "id": 7 }`, or `{ "name": "..." }` among the user's own of that form) to `resolve_field`, `launch_job` or `plan_job`: its
values are the starting point and `values` are laid over them. Password fields are not stored, so supply them in `values`.
`launch_job` and `plan_job` from a stored job need the `expectedPayloadHash` that `resolve_field` returned for it, and
`resolve_field` refuses `storedJob` together with `subform`.

`store_job` takes the `form`, a `name` unique among the user's stored jobs of that form, the `values`, and optionally a
`description` and `expires_at` (ISO 8601 with its offset or `Z`). Its answer says which password fields were left out.

---

## Passing values

Pass `field` to resolve only that field and what it depends on. For a list row or a wizard step, pass `subform` (and
optionally `parent`, the parent form's values).

Send values as the browser holds them. A choice field also accepts a partial record or its `valueColumn` value
(`"vol1"`), and an array when it is `multiple`. Computed fields ignore sent values unless they are `editable`.

---

## Approving the exact payload

When the form is complete, `resolve_field` also returns what `launch_job` will submit:

- `modeledExtravars`: the extravars after `model`, `valueColumn` and `output` are applied,
  with password fields masked;
- `credentials`: the AnsibleForms credentials the job will use (names, not secrets);
- `payloadHash`: a SHA-256 hash of the form name, the real extravars and the credentials.

Show `modeledExtravars` to the operator, and pass the `payloadHash` they approved to
`launch_job` as `expectedPayloadHash`. The launch resolves the form again and is refused
when the payload differs, for example because a query now answers differently.
`ansibleforms_user`, `__jobid__` and `__verbose__` are added at launch and are not part of the hash.

`launch_job` checks the payload only. An edit of the form that leaves the payload the same does not refuse the launch.
Every answer of `resolve_field` also carries a `formFingerprint`, a SHA-256 hash of the form definition: to refuse a
launch after any edit of the form, compare it yourself before you call `launch_job`, as the chat assistant's
**Launch** button does.

---

## Relaunching with changes

`relaunch_job` takes a job `id` and `values`: only the fields to change, as raw values.
`values` is laid over the values the job was originally launched with, and the result is
resolved and validated exactly as by `launch_job`, list rows included, then launched as a
new job by you (`ansibleforms_user` is you, not the original submitter). File uploads from
the original job are reused.

Without `values`, it is a relaunch **as the job ran**: its stored extravars are replayed on
the server, passwords included (the preview masks them). If the form is under launch
validation `enforce`, however, the relaunch goes through the same check as a relaunch with
changes.

**Passwords are never stored with the field values**, so a relaunch that goes through the
check is refused when the form shows a password field, at the top level or in a list row
(`unsupported`, with the `passwordFields`). A password field hidden by its dependencies does
not block the relaunch. See [Launch validation](../launch-validation).

Call it with `preview: true` first: it returns `modeledExtravars` (passwords masked),
`credentials` and a `payloadHash` without launching. Confirm them with the user, then call
it again with `expectedPayloadHash`. The same permissions as a relaunch in the browser
apply: the form must allow relaunch and your roles need the `allowJobRelaunch` option. A
job without stored form data (launched before relaunch existed) and a wizard form cannot be
relaunched with changes.

The REST API offers the same through `POST /api/v2/job/{id}/relaunch` with the body
`{ "values": { ... } }`; without a body, it replays the job as it ran.

---

## Errors

A refused call is a tool error whose structured content carries a `code` and the details:

| Code | When |
|---|---|
| `form_incomplete` | `launch_job` or `relaunch_job` on a form that is not complete, with `missing`, `invalid`, `waiting`, `validationErrors` and `rowErrors` |
| `payload_mismatch` | the payload differs from `expectedPayloadHash`, with both hashes |
| `access_denied` | the user's roles do not grant the form, job, schedule or stored job, or verbose mode, or the server is read only |
| `not_found` | no such form, subform or job |
| `unsupported` | a wizard form, a subform on its own, a file field, or a `relaunch_job` that would need a shown password field |
| `no_form_data` | `relaunch_job` with changes for a job that stored no form values, such as one a schedule launched; relaunch it without changes instead |
| `invalid_request` | a request the server refuses as malformed |
| `internal_error` | anything else |
