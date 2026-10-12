---
layout: default
title: Editing in the designer
parent: Workflows
nav_order: 2
---

# Editing in the designer
{: .no_toc }

Draw a workflow, and try it without running anything
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The Workflows section

**Designer > Workflows** lists the workflow files in a file explorer, with the YAML, Visual and Preview tabs of every
[designer](../designer/) section.

- **The `+` button** in the toolbar creates a workflow file, with an empty workflow to start from.
- **YAML** shows the file as it is written. Comments and the order of the keys are kept by the other tabs too.
- **Visual** draws each workflow of the file as a graph, with its name and description above it. A file with two workflows
  shows both, one under the other.
- **Preview** is a dry run of the workflow: see [Trying it out](#trying-it-out).

Problems are listed above the graph, each with a link that opens the YAML on its line: a link to a node that does not
exist, a loop, a playbook, inventory, credential, runner or repository that the designer does not know.

---

## The graph

The graph reads from left to right, from **START** to the last nodes. Each node shows its identifier and, under it, what
it runs; the links are coloured by what makes them fire, as the legend inside the graph says: on success, on failure,
always.

- **Click START** to add a first node: a node without a parent, which runs as soon as the workflow starts.
- **Click a node** to edit it.
- **Click a link** to change what makes it fire, or to remove it.

---

## Adding a node

A new node is added with a wizard: **New node on success**, **New node on failure** or **New node always** on an existing
node, or START for a first one.

1. **What it runs**: the node's identifier, its type (playbook, workflow, approval or repository pull) and what it runs:
   a playbook of the designer, a workflow, an approval's name and timeout, or a repository.
2. **How it runs**: the run settings: the runner, the inventory, the credentials, the limit, the tags, the verbosity,
   check and diff mode, the condition (**Runs when**) and **Values from** (see [the workflow file](file.html#run-settings)).
3. **Where it goes**: the node it runs after, and on what.

**Create** adds the node to the YAML.

---

## Editing a node

Clicking a node opens its dialog, in four tabs:

| Tab | What it holds |
|---|---|
| **What it runs** | The identifier, the type and what it runs |
| **How it runs** | The run settings; credentials are picked from a list, each added with `+` |
| **Runs after** | The links into the node, and **All parents must converge** |
| **Runs next** | The links out of it, with **Link to an existing node:** and **Link to a new node:** |

**Show in YAML** opens the YAML on the node, and **Remove node** removes it with its links. Every change is written to the
YAML at once; **Save** saves the file.

---

## Trying it out

The **Preview** tab plays the workflow through without launching anything, by AWX's rules.

Every node starts as a success. Click a node to make it fail, and click it again to make it succeed; the graph then shows
which nodes would run, which would not run, and whether the workflow would fail. **Reset** makes every node succeed again.
