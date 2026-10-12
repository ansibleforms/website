---
layout: default
title: Workflows
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
---

# Workflows
{: .no_toc }

Chain playbooks, approvals and other workflows, as AWX does
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For form authors: what a workflow is, how its nodes run, and where to read on.

A workflow is a graph of nodes. Each node runs something: one of the designer's playbooks, another workflow, an approval,
or a repository pull. Links between the nodes say what runs next, on success, on failure or always. A form of
[type `workflow`](../forms/workflow.html) launches it, and the jobs page draws it live while it runs.

Workflows follow AWX's syntax and AWX's rules, so a workflow exported from AWX reads the same in AnsibleForms. They run on
the RTE, without AWX: a playbook node is a job of its own, with the node's inventory, credentials, limit and tags.

---

## How a workflow runs

The nodes run by AWX's rules, and branches that do not depend on each other run side by side.

- **A node without a parent starts at once**, when the workflow starts.
- **A link fires when its node finished**: an *on success* link after a success, an *on failure* link after a failure,
  an *always* link after either. A canceled node fires none of its links.
- **A node starts as soon as one link into it fires.** With **All parents must converge** on, it waits until every link
  into it has fired.
- **A node that can no longer start is marked *do not run***, and so are the nodes that only it could start.
- **The workflow fails when a node failed and nothing handles it**: that node has no *on failure* and no *always* link.
  A failure that a link handles does not fail the workflow.

A node with a condition (`if_extra_var`) that is not met is skipped. What follows it runs as after a success.

---

## Passing data between nodes

A node's `set_stats` data is given to the nodes after it as extra vars, AWX's way. A playbook that calls
`ansible.builtin.set_stats` with `data:` makes those values available to every node that runs after it in the
workflow, on top of the values from the form.

---

## In this section

The following pages describe workflows in detail:

| Page | What it covers |
|---|---|
| [The workflow file](file.html) | The file's syntax, the node types and each node's run settings |
| [Editing in the designer](designer.html) | The designer's Workflows section: the graph, the node and link dialogs and the dry run |
| [Running a workflow](running.html) | The form that launches it, the job page, node outputs, approvals and abort |
