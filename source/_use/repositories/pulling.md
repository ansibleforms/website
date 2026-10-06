---
layout: default
title: Pulling changes
parent: Git repositories
nav_order: 3
---

# Pulling changes
{: .no_toc }

Scheduled, manual and API pulls, and local changes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pulling changes

A repository is pulled on its schedule, at start, from the page, or through the API; there is no webhook endpoint.

| Trigger | How |
|---|---|
| Schedule | The **Cron Schedule** of the repository, for example `0 * * * *` for every hour |
| Start | **Clone on app start ?** clones the repository, or pulls it when it is already cloned |
| Settings page | **Trigger** in the row menu |
| Designer | **Load (repository)**, which pulls the forms repositories and reloads the designer |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings`) or `POST /api/v2/forms-repos/pull/<name>` (`showDesigner`) |

### Pull from a pipeline or a webhook

AnsibleForms has no dedicated webhook receiver, but a CI job or a git server webhook can call the pull endpoint.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Create the token as described in [API token](../profile/api-token.html), for a user whose role has `showSettings`, or `showDesigner`
for `/api/v2/forms-repos/pull/<name>`. `GET /api/v2/repository/<name>` returns the `head`,
`status` and `output`, so a pipeline can check which commit the instance runs after a pull.

### Local changes

A pull never overwrites work that is not pushed yet, so a scheduled pull checks the working tree before it runs.

A scheduled pull is skipped while the working tree has uncommitted changes or unpushed commits, and while a designer
holds the designer lock. A manual pull of a working tree with conflicting changes fails with:

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Push the changes, or discard them with **Reset Repository**, which deletes the working tree and clones it again.
