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

A node with a condition (`if_extra_var`) that is not met is skipped. What follows it runs as after a success. An approval
node takes no condition: it always waits for an answer.

---

## Passing data between nodes

What a node's playbook gathers with `set_stats` reaches the nodes after it as extra vars, the way AWX passes a job's
artifacts on. A node gets the data from every parent whose link into it fired, merged in the order the parents are
written, and passes on what it got plus its own job's data, its own winning a key both set.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

A node after it then reads {% raw %}`{{ version }}` and `{{ build_id }}`{% endraw %} like any other extra var.

A node's extra vars come from four places. One of them, `extra_data`, is the node's own variables: AWX's name for them,
set on the node in the [workflow file](file.html#run-settings). When two set the same key, the order of precedence is
AWX's, lowest first:

| Source | Wins over |
|---|---|
| the node's own variables (`extra_data`) | nothing |
| the data passed on with `set_stats` | the node's `extra_data` |
| the workflow's `extra_vars` | the data passed on |
| the form's values | everything |

- Only the playbook-wide data is passed on: `set_stats` with `per_host: false`, its default.
- An approval node, a skipped node and a project node pass on what came to them.
- A node's output ends with the keys it passed on, by name only, as their values may be secret.
- The node's job keeps its data as its artifacts (**Show artifacts** on its page), and the workflow job keeps all its
  nodes' data, so a nested workflow passes it on to the nodes after it too.
- A node that runs on an AWX runner passes on its AWX job's artifacts the same way.
---

## In this section

The following pages describe workflows in detail:

| Page | What it covers |
|---|---|
| [The workflow file](file.html) | The file's syntax, the node types and each node's run settings |
| [Editing in the designer](designer.html) | The designer's Workflows section: the graph, the node and link dialogs and the dry run |
| [Running a workflow](running.html) | The form that launches it, the job page, node outputs, approvals and abort |
