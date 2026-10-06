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

The MCP server offers the following tools:

| Tool | What it does |
|---|---|
| `list_forms` | The forms the user may use: name, description, categories. |
| `get_form` | One form's full definition. Each field also carries `dynamic` (evaluated from an expression or query) and `dependsOn` (the fields it reads). |
| `resolve_field` | Evaluates the form for the values filled in so far. See below. |
| `launch_job` | Launches the form with the given values, exactly as a browser submission would. Returns the job id. |
| `relaunch_job` | Launches a job again with some fields changed. See below. |
| `get_job` | Status and output of a job (`tail` limits the output to the last lines). |

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
- `payloadHash`: a SHA-256 hash of the form name, the real extravars and the credentials;
- `formFingerprint`: a SHA-256 hash of the form definition it was resolved against.

Show `modeledExtravars` to the operator, and pass the `payloadHash` they approved to
`launch_job` as `expectedPayloadHash`. The launch resolves the form again and is refused
when the result differs, for example because a query now answers differently or the form
was edited. `ansibleforms_user`, `__jobid__` and `__verbose__` are added at launch and are
not part of the hash.

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
| `access_denied` | the user's roles do not grant the form or job, or verbose mode |
| `not_found` | no such form, subform or job |
| `unsupported` | a wizard form, a subform on its own, a file field, or a `relaunch_job` that would need a shown password field |
| `invalid_request` | a request the server refuses as malformed |
| `internal_error` | anything else |
