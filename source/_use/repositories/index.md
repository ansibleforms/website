---
layout: default
title: Git repositories
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
---

# Git repositories
{: .no_toc }

Keep forms, playbooks, settings and connections in git
{: .fs-6 .fw-300 }

---

For admins who keep forms, playbooks and the app's configuration in git: what a repository can hold and which source wins.

---

## What a repository is for

A repository is a git remote that AnsibleForms clones and keeps up to date, and its usage types say what the app takes from it.

Since 7.8.0 a repository's **Usage** step lists the usage types under six headings: **Designer**, **Jobs**, **System**,
**Appearance**, **Access** and **Connections**. The **Designer** types are the files the app reads as they are:

| Usage type | What AnsibleForms reads from it | Where in the repository |
|---|---|---|
| **Forms** | The form files, which the designer also saves back into it, and their vars files | `forms`, or the root; vars files in `vars` |
| **Playbooks** | The Ansible playbooks that jobs run | `playbooks`, or the root |
| **Workflows** | The [workflow](../workflows/) files, which the designer also saves back into it | any folder |
| **Inventories** | One inventory, named after the repository, which a form names with `inventory:` | the root: `inventory.yaml`, `group_vars`, `host_vars` |
| **Categories**, **Constants** | The categories and the constants, which the designer also saves back into their file | the file giving `controller_categories:` or `controller_constants:` |

Every other type keeps settings, users or connections of the app in YAML files, read and written both ways: the schedules,
the General settings, the Appearance pages, the users, groups and roles, the sign-ins, the credentials, the runners and the
other connections. They are described in [Configuration in git](config-as-code.html).

**Forms**, **Playbooks**, **Workflows** and **Inventories** may be ticked on several repositories, and every other type on
one repository at most. A form runs the playbooks of the first **Playbooks** repository, unless it names its own with
`playbookRepository`. Every repository is cloned into a subfolder named after it, under
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

The **Use for config ?** switch of before 7.8.0 is replaced by **Roles**, **Categories** and **Constants**, each read from the
file giving its key; a repository's `config.yaml` is still read, deprecated (see
[Roles, categories and constants](config-as-code.html#roles-categories-and-constants)).

### One repository for everything

A single repository can hold forms, vars files, configuration and playbooks, with the usage types ticked and one subfolder per kind.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### One repository per purpose

Separate repositories let teams own their part, each with its own usage types and the files directly in the root.

| Repository | Usage types | Content in the root |
|---|---|---|
| `af-platform` | **Roles**, **Categories**, **Constants**, **Credentials**, **Runners** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Forms** | The form files of each team, merged into one list |
| `af-playbooks` | **Playbooks** | The playbooks and roles |

The vars files come from the `vars` folder of the first forms repository that has one.

---

## How repositories combine with local folders

Repository content replaces the matching local folder; this table summarizes where each kind of file is read from.

| Content | Read from, first match wins |
|---|---|
| Roles, categories, constants | Each key on its own: 1. the file giving `controller_roles:`, `controller_categories:` or `controller_constants:` in the repository with that usage type <br> 2. that repository's `config.yaml` (deprecated) <br> 3. the base configuration: the database, when the configuration is kept there ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), else [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Forms | Every **Forms** repository plus `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) only when there is none |
| Playbooks | The **Playbooks** repository, otherwise [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Vars files | The `vars` folder of the first **Forms** repository that has one, otherwise [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Every **Workflows** repository plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), together |

Forms from several repositories are read in the order the repositories were added. When two of them hold a form with the same
name, the copy of the repository added first is used, and a warning names both copies, so keep form names unique across repositories.

---

## Troubleshooting

Most problems show in the **Pull** column and in **Show last pull output** (or **Show last push output**), which hold git's own
error message.

- [A repository clone or pull failed](../troubleshooting.html#a-repository-clone-or-pull-failed): authentication, known
  hosts and local changes.
- [The forms repository is not cloned yet](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): the designer
  cannot save before the first clone.
- A repository stuck in `running` is reset to `failed`: after a restart, at the next start; within a minute once the node
  that runs its git operation stops answering for 2 minutes; and in any case after 2 hours. Run **Pull** again.

---

## In this section

Each topic has a page of its own:

| Page | What it covers |
|---|---|
| [Adding a repository](adding.html) | The Repositories page, every field of a repository, and declaring one in the config seed |
| [Authentication](authentication.html) | HTTPS with a token, SSH with the generated key, and custom git commands |
| [Pulling changes](pulling.html) | Scheduled, manual and API pulls, and local changes |
| [Designer and push](designer.html) | Edit forms in the designer and push them to the repository |
| [Configuration in git](config-as-code.html) | Every setting kept in a git repository, read and written both ways |
