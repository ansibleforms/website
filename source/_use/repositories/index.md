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

Keep forms, configuration, playbooks and vars files in git
{: .fs-6 .fw-300 }

---

For admins who keep forms, configuration and playbooks in git: what a repository can hold and which source wins.

---

## What a repository is for

A repository is a git remote that AnsibleForms clones and keeps up to date, and each one has switches that say what it holds:

| Switch | What AnsibleForms reads from it | Folder in the repository |
|---|---|---|
| **Use for config ?** | `config.yaml` with the categories, roles and constants | the root |
| **Use for forms ?** | The form files, which the designer also saves back into it | `forms`, or the root |
| **Use for playbooks ?** | The Ansible playbooks that jobs run | `playbooks`, or the root |
| **Use for vars files ?** | The vars files that forms load | `vars`, or the root |

Without the subfolder, the repository root is used. One repository can hold everything; if you split them, only **Use for
forms** may be on several (their forms are merged): the other switches take the first repository and log a warning.

Every repository is cloned into a subfolder named after it, under [`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

### One repository for everything

A single repository can hold all four kinds of content, with every switch enabled and one subfolder per kind.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### One repository per purpose

Separate repositories let teams own their part, with one switch each and the files directly in the root.

| Repository | Switch | Content in the root |
|---|---|---|
| `af-config` | **Use for config ?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **Use for forms ?** | The form files of each team, merged into one list |
| `af-playbooks` | **Use for playbooks ?** | The playbooks and roles |
| `af-vars` | **Use for vars files ?** | The vars files |

Only forms can come from several repositories; config, playbooks and vars files each come from one.

---

## How repositories combine with local folders

Repository content replaces the matching local folder; this table summarizes where each kind of file is read from.

| Content | Read from, first match wins |
|---|---|
| Configuration | 1. the database, when the configuration is kept there ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. `config.yaml` of the **Use for config** repository <br> 3. `config.yaml` of a **Use for forms** repository, when no repository is used for config <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Forms | Every **Use for forms** repository plus `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) only when there is none |
| Playbooks | The **Use for playbooks** repository, otherwise [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Vars files | The **Use for vars files** repository, otherwise [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |

Forms from several repositories are merged into one list. When two of them hold a form with the same name, the first one
loaded is kept and the warning `skipping duplicate form <name>` is logged, so keep form names unique across repositories.

---

## Troubleshooting

Most problems show in the **Status** column and in **Show output**, which holds git's own error message.

- [A repository clone or pull failed](../troubleshooting.html#a-repository-clone-or-pull-failed): authentication, known
  hosts and local changes.
- [The forms repository is not cloned yet](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): the designer
  cannot save before the first clone.
- A repository stuck in `running` after a restart is reset to `failed` at the next start; run **Trigger** again.

---

## In this section

Each topic has a page of its own:

| Page | What it covers |
|---|---|
| [Adding a repository](adding.html) | The Repositories page, every field of a repository, and declaring one in the config seed |
| [Authentication](authentication.html) | HTTPS with a token, SSH with the generated key, and custom git commands |
| [Pulling changes](pulling.html) | Scheduled, manual and API pulls, and local changes |
| [Designer and push](designer.html) | Edit forms in the designer and push them to the repository |
