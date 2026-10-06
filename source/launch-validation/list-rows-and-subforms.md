---
layout: default
title: List rows
parent: Launch validation
nav_order: 3
---

# List rows
{: .no_toc }

How rows of list fields are validated
{: .fs-6 .fw-300 }

---

A `list` field holds rows; each row is an instance of its subform, filled in through the row
editor. A `yaml` field with a `subform` is one such row. The server treats them the same way
as the browser's row editor: each row is resolved through its subform, with the form's values
as `__parent__`, its rules checked and its computed fields evaluated. Nested lists work the
same way: in a row's own list, `$(__parent__.__parent__.x)` reaches the form.

Rows are checked as follows:

- **A row the user added or edited** in the editor is resolved and validated.
- **A row nobody touched**, one produced by the list's own default, expression or query
  (such as the existing entries of an ACL list), passes **exactly as it came**, as in the
  browser: it is not revalidated and nothing is added. An existing entry that breaks a rule
  written later does not stop the launch.
- **A row marked deleted** (the list's `deleteMarker`) is kept as it is and not validated.

To tell these rows apart without trusting the request, the server runs the list's own
source (its default, otherwise its expression or query) again under launch validation. A row
that did not go through the editor passes unchanged **only when it is one of the rows that
source produces**. Any other row, such as one invented by a REST caller, is resolved and
validated like an edited row. A plain row therefore cannot bypass the checks, while the
browser's untouched rows still pass unchanged.

A browser user notices this in only one case: the source's data changed between opening the
form and launching it (an entry was changed or removed in the meantime), **and** that row
breaks a rule of its subform. The row then no longer counts as one of the source's rows, so
it is validated, and the launch is refused with the row named, for example
`acls[2].user_or_group (regex)`.

Failing rows appear in `rowErrors` with their `index` (a `yaml` field has none) and in the log as
`disks[1].size (maxValue)`.

A launch may hold at most **500 rows** across all nesting levels, since each row runs its subform's queries.

## Row markers

The markers a list sets on its rows (`insertMarker`, `updateMarker` and `deleteMarker`; new
rows get `__inserted__` when rows can be deleted or updated but no `insertMarker` is set)
reach the playbook on every row that carries one. A removed row is sent with its delete
marker, so the playbook can remove it. Before 6.4.1 a list row only carried a marker when its
subform declared it as a (hidden) field.
