---
layout: default
title: Designer
nav_order: 4
has_children: true
has_toc: false
permalink: /designer/
---

# Designer
{: .no_toc }

Edit forms, playbooks, inventories and workflows in the browser
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For form authors: the designer's sections, and what each of their tabs shows.

The designer needs the `showDesigner` [role option](../config/roles.html#role-options). It edits one item at a time, a
form, a playbook or a workflow file, with its sections in the left menu. Changing the playbooks also needs
`allowPlaybookDesign` (on by default): without it, the **Playbooks** section is read-only and the server refuses to save,
create, remove or push a playbook. Forms and workflows can still pick a playbook, and the other sections are not affected. Only one person edits at a time: see
[The designer lock](lock.html).

---

## Its sections

Each section edits one kind of file, kept locally or in a [repository](../repositories/):

| Section | What it edits |
|---|---|
| **Forms** | The form files |
| **Categories** | The categories of `config.yaml` |
| **Constants** | The constants of `config.yaml` |
| **Vars files** | The vars files that forms load |
| **Playbooks** | The playbooks that forms and workflows run |
| **Inventories** | The inventories: `inventory.yaml`, `group_vars` and `host_vars` |
| **Workflows** | The [workflow](../workflows/) files |

The sections with files list them in a file explorer and open the first one; a section with no files yet says so. The
Inventories and Workflows sections have a `+` button in the toolbar for a new inventory or workflow.

---

## Its tabs

Every section has the same three tabs, all on the same YAML: an edit in one shows in the others, and **Save** saves it.

- **YAML** is the file as it is written.
- **Visual** edits it with fields. Only the keys an edit touches change, so comments and the rest stay as written.
- **Preview** shows what it does, and edits nothing.

What the Visual and Preview tabs show, section by section:

| Section | Visual | Preview |
|---|---|---|
| **Forms** | The form's settings and its fields, with lists of the designer's playbooks, inventories and workflows | The form as it is now, unsaved edits included; its submit runs nothing |
| **Categories** | The categories as a table, edited | The Forms page's menu, built from them |
| **Constants** | The constants as an outline, edited (a key moves with the arrow keys) | Each constant with its reference, `$(NAME)`, to copy, and the forms that use it |
| **Vars files** | The variables, edited | Each variable with its reference in a playbook, {% raw %}`{{ name }}`{% endraw %}, to copy, and the forms that load the file |
| **Playbooks** | The plays: each play's name, hosts, **Become**, **Gather facts** and roles, and its tasks, each with its module and arguments | The playbook's outline: its plays, with their hosts, roles and tasks, and the playbooks it imports |
| **Inventories** | The groups, their child groups, their hosts, and the variables each sets | The inventory as a tree, with its `group_vars` and `host_vars` |
| **Workflows** | The workflow's graph, to [edit it](../workflows/designer.html) | A [dry run](../workflows/designer.html#trying-it-out): click a node to make it fail |

When the YAML cannot be read, the Visual and Preview tabs say why, with **Show in YAML** to open the YAML on the line.
