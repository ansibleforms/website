---
layout: default
title: Ansible's own layout
parent: Git repositories
nav_order: 6
---

# A repository in Ansible's own layout
{: .no_toc }

Run a form's playbook from its repository's root, as AWX does
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For admins and form authors whose playbooks live in a repository laid out as Ansible documents it, since 7.8.0.

---

## The layout

Ansible's own layout keeps the configuration, the inventories, the playbooks and the roles side by side at the repository's root.

```
infra/
├── ansible.cfg              # roles_path = ./roles
├── inventories/
│   ├── development/
│   │   ├── hosts.yaml
│   │   └── group_vars/
│   └── production/
│       ├── hosts.yaml
│       └── group_vars/
├── playbooks/
│   └── site.yml
└── roles/
    └── webserver/
```

The playbooks sit in `playbooks/` and the roles in `roles/`, so Ansible finds the roles through the `ansible.cfg` at the
root, which it reads only when `ansible-playbook` starts in that folder:

```ini
[defaults]
roles_path = ./roles
```

Relative paths in `ansible.cfg` are read from the folder that holds it, so `collections_path = ./collections` works the
same way. AWX runs a project's playbooks from the project's root, and since 7.8.0 a form can do the same.

---

## Naming the repository in a form

A form names the repository its playbook runs from with `playbookRepository`, on an `ansible` form.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

The job then runs from the root of `infra`, whatever folder the playbooks are in:

| What | Read from |
|---|---|
| `ansible.cfg` | The repository's root, with its `roles_path`, `collections_path` and every other setting |
| `playbook` | The root: `playbooks/site.yml`, not `site.yml` |
| A relative `inventory` or `__inventory__` | The root: `inventories/production/hosts.yaml` |
| `playbookSubPath` | Still moves the run folder, now from the root |

An inventory named by its name (`inventory: production`) is still one of the designer's
[inventories](../designer/), as before. The repository must have the **Playbooks** usage type: a name that is not a
repository used for playbooks fails the job with `playbookRepository '<name>' is not a repository used for playbooks`.

An `ansible` step of a [multistep form](../forms/multistep.html) names its own `playbookRepository`, and a playbook node of a
[workflow](../workflows/file.html#ansibleforms-own-keys) names it as `playbook_repository`.

---

## The repository the form is in

Since 7.8.0 a form kept in the same repository as its playbook names it `__self__`, instead of repeating its name.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: __self__
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
```

`__self__` is the repository the form is read from, and it must have the **Playbooks** usage type, as any repository a form
names. On a playbook node of a workflow, `playbook_repository: __self__` is the repository the workflow file is in.

A form in the local forms folder is in no repository, so its `__self__` names none. The form then gets a load error naming
it, `Form '<name>': playbookRepository __self__ names the repository the form is in, and the form is in none`, and its
launch is refused, saying why. A workflow node's `__self__` in a file of the local workflows folder fails the node's job.

---

## Several playbooks repositories

Since 7.8.0 several repositories may have the **Playbooks** usage type; before, only the first one was used, with a warning.

| The form | Where its playbook runs from |
|---|---|
| Without `playbookRepository` | The first repository used for playbooks, in the order they were added: its `playbooks` folder, else its root, exactly as before 7.8.0 |
| With `playbookRepository: <name>` | The root of that repository, the first one included |

A form that names the first repository therefore runs from its root, and gives its `playbook` from there
(`playbooks/site.yml`). The forms that do not name one keep running as they always did.

---

## In the designer

The designer offers the repository and the playbooks that go with it, on a form and on a workflow node.

| Where | What it shows |
|---|---|
| A form's **Visual** tab | **Repository**, above **Playbook**, when there are several playbooks repositories or the form names one. Its first option, **First playbooks repository**, removes the key; the second, **This form's repository (name)**, writes `__self__` |
| **Playbook** | The playbooks of the repository picked, named from its root; with **First playbooks repository**, the first one's, as it runs them |
| A workflow's playbook node | The same **Repository** field, on its **How it runs** tab, with **This workflow's repository (name)** for `__self__`, and the playbooks of that repository on **What it runs** |
| The **Playbooks** section | The first repository's playbooks, from its `playbooks` folder (else its root), then every other repository whole, in a folder named after it |

The [**Edit all playbooks**](../designer/#limited-designers) role option counts a playbook by its repository and its path: a
form that runs `playbooks/site.yml` of `infra` uses that file, not a `site.yml` of the first repository.

---

## On an RTE runner

An [RTE](../rte/) receives the repository the job names, in either of its [files modes](../rte/modes.html).

- With `RTE_FILES=transfer`, the default, the app sends the whole repository the form names, packed, instead of the first
  repository's `playbooks` folder.
- With `RTE_FILES=local`, the RTE runs from its own clone of that repository, under `REPO_PATH`.

The RTE must be 7.8.0 or later to run a form that names its repository. AWX, Semaphore, Rundeck and Jenkins runners run
their own templates and jobs: `playbookRepository` is not a key of their forms, and a workflow node on such a runner has none.

---

## Example: one form for every environment

The form below runs `playbooks/site.yml` of `infra` against the inventory of the environment the user picks.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
roles:
  - admin
categories:
  - Deploy
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

The `__inventory__` field gives the inventory `inventories/production/hosts.yaml` for **production**, read from the root of
`infra`, with the `group_vars` beside it. The roles of `site.yml` come from `roles/`, through `roles_path` in `ansible.cfg`.

---

## The same before 7.8.0

Before 7.8.0 a form could only step out of the `playbooks` folder of the one playbooks repository, with `playbookSubPath: ../`.

```yaml
name: Deploy the web servers
type: ansible
playbookSubPath: ../
playbook: playbooks/site.yml
roles:
  - admin
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

It runs from the root too, with these limits, which `playbookRepository` removes:

- Only the first repository used for playbooks could be reached, so the Ansible layout had to be that one.
- The designer's playbook list showed `site.yml`, from the `playbooks` folder, so `playbooks/site.yml` was typed by hand.
- With `RTE_FILES=transfer`, the default, the RTE received only the `playbooks` folder, so `../` did not reach the
  `ansible.cfg`, the roles and the inventories: it worked only with `RTE_FILES=local`.

Moving such a form to 7.8.0 means replacing `playbookSubPath: ../` with `playbookRepository: <name>`; `playbook` and
`__inventory__` stay as they are.
