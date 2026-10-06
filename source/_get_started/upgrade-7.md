---
layout: default
title: Upgrading to v7
parent: Upgrading
nav_order: 0.5
---

# Upgrading to v7
{: .no_toc }

What to change while still on 6.5, before you move to version 7
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

AnsibleForms 7 removes everything that 6.x marked as deprecated. Most of it can be fixed
while you are still on 6.5, where the old and the new way both work. Do that first, then
upgrade.

## Before you upgrade (on 6.5)

### Forms live in their own files

Forms live only in the forms folder (`FORMS_FOLDER_PATH`) or a forms repository; `config.yaml` keeps categories, roles and constants.

- **A `forms.yaml` file:** rename it to `config.yaml`. On 6.5 the settings page has a
  **Convert forms.yaml to config.yaml** button for this.
- **A `forms:` section in the base config:** version 7 rejects it. Move each form to its own file, for example
  by dragging it to a file in the 6.5 designer.
- **Environment variables:**

  | Removed | Use instead |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` and `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### The `table` field

Version 7 rejects `table` fields: use a `list` field with a `subform`, and turn each column's `from` into an expression
on `__parent__` (see the [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Renamed properties

| Removed | Use instead |
|---|---|
| `disableRelaunch: true` (form) | `allowRelaunch: false` |
| `noOutput: true` (field) | `output: false` |
| `enableLogin` (role option) | `allowLogin` |

### Datasources and data schemas

The datasource imports and their admin pages have been removed, as has the
AnsibleForms Galaxy collection, whose modules only served them.

- Scheduled imports stop and the datasource tables are dropped: note down what you need first.
- The data schemas an import filled are databases of their own and stay. A form that
  queries them through a credential keeps working.
- To keep that data fresh, run the import as a playbook of your own, for example from a
  schedule.

### API v1

`/api/v1/*` has been removed; use `/api/v2/*` (interactive docs at `/api/v2/docs`). The calls
scripts typically use are:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

v2 responds with HTTP status codes (`400`, `403`, `404`, `422`) and a plain JSON body, not v1's
`{ status, message, data }` envelope.

## Image tags

`latest` moves to 7 with 7.0.0. To stay on 6, use the tag `6` (or `6.5`) instead of `latest`.
All tags are listed under [Image tags](installation/#image-tags).

## Rolling back

Take a backup before you upgrade (**Settings → Backups**). 6.5 runs on a database upgraded to 7, but only
the backup restores the dropped datasource definitions.
