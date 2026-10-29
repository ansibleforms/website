---
layout: default
title: Designer
nav_order: 1
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
form, a playbook or a workflow file, with its sections in the left menu. Each kind of file also needs its own option, all
on by default: `allowPlaybookDesign` for the **Playbooks**, `allowWorkflowDesign` for the **Workflows**,
`allowInventoryDesign` for the **Inventories** and `allowVarsFileDesign` for the **Vars files**. Without one, its section is
read-only and the server refuses to save, create, remove or push its files; forms and workflows can still pick them. The
**Forms**, **Categories** and **Constants** need `allowFormDesign` the same way: without it they are read-only, and the server
refuses to save, pull or push them. A role can also hide the forms, playbooks and workflows of other teams: see
[Limited designers](#limited-designers). Only one person edits at a time: see [The designer lock](lock.html).

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
**Forms** section and every file section have a **New file** button first in their toolbar: in the Inventories it makes a new
inventory, in the Workflows a new, empty workflow. The explorer's magnifying glass opens a box that filters its files by name.

The search box on the title line finds a text in the YAML that is open: it marks every place it appears. It works on the
**YAML** tab, once the designer lock is yours.

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

---

## Limited designers

From 7.5.0 three role options limit which forms, playbooks and workflows the designer shows, so each team designs its own.
All three are on by default and always on for admins:

| Option | Turned off, the designer shows only |
|---|---|
| `designAllForms` (**Edit All Forms**) | The forms whose `roles` hold one of the user's roles, and the subforms no hidden form uses |
| `designAllPlaybooks` (**Edit All Playbooks**) | The playbooks the user's forms run, and the ones no form uses yet |
| `designAllWorkflows` (**Edit All Workflows**) | The workflow files the user's forms run, nested ones included, and the ones no form uses yet |

A form runs a playbook through its `playbook`, its ansible steps and the workflows it runs. What a limited designer cannot do:

- **See a hidden file.** It is never listed nor named: opening one answers as a missing file, and a new file with its name
  as a file that is already there.
- **Point at one.** A form that names a hidden form as a subform shows nothing of it, and a form or workflow file that
  names a hidden playbook or workflow is refused.
- **Change a shared subform.** A subform that a hidden form uses too is read-only, and a saved form must keep one of the
  user's roles.
- **Touch the hidden forms of a file.** A file holding several forms keeps the hidden ones as they are on a save, and
  restoring a forms backup is refused.
- **Add code the server runs.** A saved form may not gain an expression or a query the server runs, and the preview of a
  form not saved yet runs no expression of its own.
- **Read file names in git output.** The output of a pull or a push leaves out the lines that name files.

`allowFormDesign`, `allowPlaybookDesign` and `allowWorkflowDesign` still decide whether the files shown can be changed.
Inventories, vars files, categories and constants stay visible to every designer. A user with only part of the settings sees
only their own forms and workflow files on the settings pages' **Forms** tabs and on a credential's **Used by** tab.
