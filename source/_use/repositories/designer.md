---
layout: default
title: Designer and push
parent: Git repositories
nav_order: 4
---

# Designer and push
{: .no_toc }

Edit forms in the designer and push them to the repository
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Editing and pushing from the designer

With a repository used for forms, the designer edits the files in its working tree and pushes them back to the remote.

| Button | What it does |
|---|---|
| **Save (local)** | Writes the forms and `config.yaml` into the working trees, without committing |
| **Save (repository)** | Commits and pushes the saved changes; enabled once there are unpushed changes |
| **Load (repository)** | Pulls the forms repositories and reloads the designer, after a confirmation if edits are unsaved |

Forms stay in their repository; new ones wait, already usable, in [`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH) until you push.
With several forms repositories, **Save (repository)** and **Load (repository)** ask which one, defaulting to the `config.yaml` one.

A push stages all changes, commits them as `AnsibleForms` with the message `Forms sync by <user>`, then fetches, rebases on
the remote and pushes, retrying up to five times. A rebase conflict is aborted and the conflicted files are listed;
fix them in the remote, or use **Reset Repository**. **Push to repo** on the Repositories page does the same.

When a single forms repository is cloned empty, AnsibleForms copies the local `config.yaml` and forms into its working
tree, so a **Push to repo** publishes them. More on the designer is in [Designer and git](../gui/designer-and-git.html).
