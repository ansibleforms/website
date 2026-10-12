---
layout: default
title: Rolling it out
parent: Launch validation
nav_order: 7
---

# Rolling it out
{: .no_toc }

Move an instance to enforce, and the known limitations
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Rolling it out

Move an instance to `enforce` in steps, watching the log before refusing anything:

1. Set `launchValidation: log` on the forms launched over REST, or `LAUNCH_VALIDATION=log` for the whole instance.
2. Run in this mode for a while and review the log: `would refuse` warnings indicate launches
   that break the rules; `extravars differ` warnings indicate forms that compute something
   differently on the server (a timestamp, outside data). Decide for each form whether that
   matters.
3. Switch those forms to `launchValidation: enforce`. Callers that sent invalid values or
   made-up extravars now get a `422` with the reason.
4. When every form behaves as expected, consider `LAUNCH_VALIDATION=enforce` for the whole instance.

---

## Limitations

Launch validation does not cover everything yet:

- **Wizard forms** cannot be relaunched with changes, and a wizard job launched before 7.0
  cannot be relaunched under `enforce` (it did not store its step values). The MCP server
  cannot launch wizard forms.
- **Placeholder resolution** in the browser still uses its own copy of the server's code; in
  rare edge cases (`__undefined__`, quotes inside expressions) the two could resolve a
  placeholder differently. `log` reveals such differences.
- **`runLocal`** expressions run in the browser's JavaScript engine in the browser and in a
  sandbox on the server; the same code produces the same result, except where it depends on
  the browser's timezone or locale.

---

## Wizard forms

A [wizard](../forms/wizard.html) is checked step by step: the browser sends the values of
each step, and the server checks every step the user would submit against its own subform.

- A step is left out when it is `optional` and the user skipped it, or when its `when` is false.
- A step reads the earlier steps through `$(__parent__.<step>.<field>)`, with their checked values.
- Errors name the step and the field, as `<step>.<field>`.
- Under `enforce`, the extravars are built on the server, each step under its `defaultModel`.
- File fields are not supported in a wizard.
