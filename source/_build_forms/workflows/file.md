---
layout: default
title: The workflow file
parent: Workflows
nav_order: 1
---

# The workflow file
{: .no_toc }

The workflow syntax, the node types and each node's run settings
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Where workflow files live

Workflow files are YAML files in the local workflows folder and in every repository used for workflows.

- **The local folder** is [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), `workflows` under the
  persistent folder by default.
- **A repository** with **Use for workflows ?** on is read as a whole, so its workflow files can sit in any folder. The
  designer saves them back into the repository, and **Push** sends them to the remote.

Every YAML file that holds `workflow_job_templates` is read, up to six folders deep, and one file may hold several
workflows. A form names a workflow by its `name`, so keep the names unique: when two workflows share a name, a job that
runs it fails and says to rename one of them.

---

## The syntax

A workflow file is written in the syntax of an AWX export, with the nodes under `related.workflow_nodes`:

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

The shape of the `awx.awx` collection is read too: `workflow_nodes` directly under the workflow, and names written as
plain strings (`inventory: staging`) rather than maps (`inventory: {name: staging}`).

### The workflow

A workflow entry has a few keys of its own, next to its nodes:

| Key | What it is |
|---|---|
| `name` | The workflow's name, which a form's `workflow:` names |
| `description` | What it is for, shown in the designer |
| `extra_vars` | Variables every node gets; the form's values win over them |
| `related.workflow_nodes` | The nodes |

### A node

Each node has an identifier, what it runs and its links:

| Key | What it is |
|---|---|
| `identifier` | The node's id: letters, digits, dots, dashes, colons and underscores, unique in the workflow |
| `unified_job_template.type` | What the node runs: see [node types](#node-types) |
| `unified_job_template.name` | The playbook, workflow, approval or repository it runs |
| `related.success_nodes` | The nodes that run when this one succeeds |
| `related.failure_nodes` | The nodes that run when this one fails |
| `related.always_nodes` | The nodes that run when this one finished, either way |
| `all_parents_must_converge` | `true`: the node waits for every link into it to fire, not only one |

Links must lead forward: a workflow whose links loop does not run.

---

## Node types

A node runs one of four things, named as AWX names them:

| Type | What the node runs |
|---|---|
| `job_template` | One of the designer's playbooks, as a job of its own on the RTE; or, with `runner:`, that runner's template or job |
| `workflow_job_template` | Another workflow, as a child workflow job; workflows nest up to five deep |
| `workflow_approval_template` | An approval: the workflow job waits until someone approves or rejects it |
| `project` | A pull of the repository it names (AWX's project update) |

An approval node's `unified_job_template.timeout` is in seconds. When it passes with no answer, the node fails; `0` or no
timeout waits for an answer however long it takes. A rejected approval fails the node, and the workflow goes on along its
links.

---

## Run settings

A `job_template` node takes the settings of an AWX node, on the node itself:

| Key | What it does |
|---|---|
| `inventory` | The inventory the playbook runs against, by its name, as a form's `inventory:` |
| `related.credentials` | The credentials: a vault one opens the vaults, the first SSH one signs in, the others reach the playbook under their own name |
| `limit` | Runs on these hosts only (`--limit`) |
| `job_tags` | Runs the tasks with these tags only (`--tags`) |
| `skip_tags` | Skips the tasks with these tags (`--skip-tags`) |
| `verbosity` | `0` to `5`: the number of `-v` |
| `diff_mode` | `true`: shows the changes (`--diff`) |
| `job_type` | `check`: a dry run (`--check`); `run` or none: a real run |
| `extra_data` | Variables this node gets, under the workflow's `extra_vars` and the form's values |

The node's job gets the form's values as extra vars. The form's values win over the workflow's `extra_vars`, which win
over the node's `extra_data`, as a survey's answers do in AWX.

---

## AnsibleForms' own keys

Three keys of a node are AnsibleForms' own, and AWX ignores them, so a workflow can do what a multistep form does:

| Key | What it does |
|---|---|
| `runner` | On a `job_template` node, runs that runner's template or job instead of a designer playbook: AWX, AAP, Ascender, Semaphore, Rundeck or Jenkins. An RTE runner runs the node's playbook there. One workflow can mix them. |
| `if_extra_var` | The node runs only when this extra var is `true`, as a multistep step's `ifExtraVar`. Not met, the node is skipped, and what follows it runs as after a success. Not on an approval node, which always runs. |
| `extra_vars_key` | The node gets only this key of the extra vars, with the user copied in, as a multistep step's `key` |

On a template runner, `unified_job_template.name` is the template or job to run, and the node's inventory, credentials,
limit, tags and check mode are passed as a form of that runner's type would pass them.
