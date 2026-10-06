---
layout: default
title: Limitations
parent: MCP server
nav_order: 3
---

# Limitations
{: .no_toc }

Expressions run on the server, and what the MCP server does not do
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## runLocal expressions

`runLocal` expressions, `local` / `credential` / `html` fields and `evalDefault` defaults are
evaluated on the server, in a separate V8 context: no `process`, `require`, network or
timers, no compiling strings into code, a 2-second time limit, and only the helper
functions the browser offers (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

This guards against buggy or runaway expressions. It is not a sandbox for hostile code,
and it does not need to be: the code comes from the form definition, never from the MCP
caller, and every value a caller sends is substituted as a JavaScript literal.

An expression that uses a browser API (`window`, `document`, `fetch`) cannot run here and
returns `status: error`.

Server-side expressions (without `runLocal`) go through the same
[`EXPRESSION_SANITIZER`](../customization) rules as they do for the browser.

---

## Limitations

Some forms and fields cannot be used through the MCP server yet:

- **Wizard forms** cannot be launched yet. Their steps can be resolved with `subform`.
- **File fields** cannot be filled in; a form whose file field has a value is refused.
- **List rows** (and a `yaml` field with a subform, which is one such row): every row you
  send, except one carrying the list's `deleteMarker`, is resolved through its subform with
  the form's values as `__parent__` and then validated. This includes nested lists, where
  `__parent__.__parent__` reaches the form. Send plain rows, that is, the raw subform field
  values. Failing rows are listed per list field in `rowErrors`
  (`vms[1].disks[0].size (missing)` in the message). At most 500 rows are accepted per call,
  across all levels.
- An enum left on `__auto__` is never filled in with its first option; the caller must choose.
- Every MCP request creates one entry in the audit log (action "MCP request"); the
  job itself is recorded under the user, as for any other launch.
