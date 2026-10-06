---
layout: default
title: Log and enforce
parent: Launch validation
nav_order: 2
---

# Log and enforce
{: .no_toc }

What each mode does with a launch that breaks the rules
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## What `log` does

Every launch is checked, but nothing changes for the user. A warning is written to the log when:

- the launch **would be refused**, with the reason (field names and rule types only, never
  values):

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- the extravars the client sent **differ** from the ones the server builds, with the
  top-level keys that differ:

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Run `log` on a real instance for a while first. It shows which forms would be refused and
which compute values differently on the server, before anyone is affected.

## What `enforce` does

Under `enforce`, an invalid launch is refused, and a valid one runs the extravars the server
builds.

### A launch that breaks the rules is refused

`POST /api/v2/job` answers `422` with the failing fields:

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing` - required fields without a value;
- `invalid` - fields that break a rule, choices that are not one of the options, and list
  fields with a failing row;
- `waiting` - fields that could not be evaluated (a field they need never got a value);
- `validationErrors` - per field, every failing rule with the message the browser shows;
- `rowErrors` - per list field, the failing rows (see [List rows](list-rows-and-subforms.html));
- `uploads` - file fields whose upload could not be verified.

A launch **without `rawFormData`** (the v1 API, or a REST call that leaves it out) is refused too: its values cannot
be checked.

### A valid launch runs the server's extravars

The job does not run the extravars the client sent. The server builds them from the checked
values, using the same code as the browser, and runs those. A caller that sends valid
`rawFormData` next to different `extravars` gets the extravars that match the values, not
the ones it sent.

From the request, the server keeps `__verbose__` (only for users allowed to use verbose mode). The
reserved keys (`__playbook__`, `__inventory__`, ...) come from the form, as always, and
`ansibleforms_user` is the launching user.

### What the user saw is not always what runs

Building the extravars means evaluating the form again: every expression and query runs
once more on the server, a moment after the browser ran it, as the launching user. A value
that depends on **when** or **where** it is evaluated can differ, and in that case the
server's value is used:

| What | Why it can differ | How much |
|---|---|---|
| `fn.fnTime()`, a timestamp, a name built from the time | evaluated again, a few seconds later | only matters at a second or a date boundary. `fnTime` already runs on the server in the browser flow too, with the same timezone (the container's `TZ`) |
| a query, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, a file read | the outside data changed in between | only when it changed |
| a `runLocal` expression using `new Date()`, `toLocaleString`, `Intl` | the browser uses the user's timezone and locale, the server its own | only such expressions |

The same applies to **validation**: a rule that reads such a field (`notIn` against a query's
result, `validIf` on a computed flag) is checked against the server's value. Forms whose
extravars differ appear in the `log` warnings described above; review them before enforcing.
