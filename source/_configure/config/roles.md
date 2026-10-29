---
layout: default
title: Roles
parent: config.yaml
nav_order: 2
---

# Roles
{: .no_toc }

Map users and groups to roles, and set what each role may do.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The roles attribute

The top-level `roles` list of config.yaml:

{% include config_attribute.html name="roles" %}

---

## The default role

Every signed-in user has the `default` role, so a form with `roles: [default]` is open to everyone who can sign in. There
is no anonymous access: nobody gets this role without signing in.

The role holds no groups and no users, since it already applies to everyone. Its `options` are everyone's defaults, as
described under [Role options](#role-options) below. `config.yaml` must have an `admin` and a `default` role, and the
roles page shows both as **Required**.

`default` was called `public` before 7.0.0, and the old name keeps working:

- **In a form**, `roles: [public]` still matches every user, so forms in your repositories need no change.
- **In `config.yaml`**, a role called `public` is renamed `default` in the file when the config loads. Only the name
  changes, a backup of the config is taken first, and a config kept in a repository then has a change to push.
- **In a ytt template**, the template is not rewritten: the config it produces is renamed, and a warning in the log asks
  you to rename the role in the template too. Version 8 refuses a `public` role there.

A config with both a `default` and a `public` role is refused, because they are the same role.

---

## Role object

Each entry of the `roles` list:

{% include config_object.html name="Role" %}

---

## Role options

The `options` of a role switch features on or off for its members. From 7.3.0 the role's page shows them in four groups,
each option with an (i) that says what it gives, the same text the **Permissions** view of the profile shows:

| Option | Allows the user to | Default |
|---|---|---|
| **Settings** | | |
| `showSettings` | See and change every settings page; the server log and backups have their own options | Admins only |
| `showAppearanceSettings` | Change the appearance settings, without the other settings (from 7.3.0) | Off |
| `showConnectionsSettings` | Manage the connections settings (credentials, runners and more), without the other settings (from 7.3.0) | Off |
| `showLogs` | See the server log | Admins only |
| `showAuditLog` | See the audit log, without the other settings (from 7.3.0) | Admins only |
| `allowBackupOps` | Back up and restore the database | Admins only |
| **Designer** | | |
| `showDesigner` | See and use the designer | Admins only |
| `allowFormDesign` | Edit the forms config in the designer: categories, constants and forms. Without it, read-only (from 7.3.0) | On |
| `designAllForms` | Show and edit every form in the designer. Without it, only the forms of the user's roles (from 7.5.0) | On |
| `allowPlaybookDesign` | Edit the playbooks in the designer: save, create, remove and push them. Without it, read-only | On |
| `designAllPlaybooks` | Show and edit every playbook in the designer. Without it, only the ones the user's forms use or no form uses yet (from 7.5.0) | On |
| `allowWorkflowDesign` | Edit the workflows in the designer: save, create, remove and push them. Without it, read-only | On |
| `designAllWorkflows` | Show and edit every workflow in the designer. Without it, only the ones the user's forms use or no form uses yet (from 7.5.0) | On |
| `allowInventoryDesign` | Edit the inventories in the designer: save, create, remove and push them. Without it, read-only | On |
| `allowVarsFileDesign` | Edit the vars files in the designer: save, create, remove and push them. Without it, read-only | On |
| **Jobs** | | |
| `showJobs` | See the jobs page | On |
| `showAllJobLogs` | See the jobs of every user, not only their own | Admins only |
| `manageAllJobs` | Abort, delete and relaunch the jobs of every user; deleting and relaunching also need the two options below (from 7.3.0) | Admins only |
| `showExtravars` | See the extravars of a form and of a job | On |
| `showDebugButtons` | See the debug buttons on a form | On |
| `showArtifacts` | See a job's artifacts: what an AWX job returns, or what a playbook gathered with `set_stats` | On |
| `allowVerboseMode` | Run jobs in verbose mode | On |
| `allowJobRelaunch` | Relaunch a job with the form data of an earlier run | Admins only |
| `allowJobDeletion` | Delete jobs: their own, or every user's with `manageAllJobs`. Without it, the job history stays whole (from 7.3.0) | On |
| `allowScheduledJobs` | Create and manage recurring and one-time schedules, on the **Schedules** page (see the warning below) | Admins only |
| `allowPlannedJobs` | Plan a job to run once at a set time (**Run later**) | On |
| `allowStoredJobs` | Store the data of a form and load it again later | On |
| **Access and integrations** | | |
| `allowLogin` | Sign in to AnsibleForms | On |
| `allowChat` | Use the [chat assistant](../chat/), when it is enabled | On |
| `allowMcp` | Use the [MCP server](../mcp/) from an AI agent, when it is enabled | The role's `allowChat` |
| `allowFileUploads` | Upload files through a form's file fields (from 7.3.0) | On |
| `allowApiTokens` | Make [API tokens](../profile/api-token.html) for scripts, up to the longest lifetime the instance allows (from 7.3.0) | Off |
| `extendedTokenExpiration` | Also make API tokens that never expire; it needs `allowApiTokens` | Off |

Some options include others, and the role's page shows the included ones on and greyed out:

- **`showSettings`** gives `showAppearanceSettings`, `showConnectionsSettings` and `showAuditLog` too.
- **`manageAllJobs`** gives `showAllJobLogs` too, as acting on every user's jobs means seeing them.
- **The design options** only matter with `showDesigner`, and `extendedTokenExpiration` only with `allowApiTokens`.

Up to 7.2.0, `showAllJobLogs` also let a user abort and delete the jobs it showed; from 7.3.0 that takes `manageAllJobs`.
A role from before 7.3.0 with `extendedTokenExpiration` and without `allowApiTokens` gets `allowApiTokens`, so it keeps its tokens.

`designAllForms`, `designAllPlaybooks` and `designAllWorkflows` are always on for admins, and what the designer shows a user
without them is described in [Limited designers](../designer/#limited-designers).

**Admins only** means on for users who hold the `admin` role, and off for everyone else. When a user matches several roles,
the options are combined as follows:

- **Between the user's roles**, an option is on only when every role that sets it agrees: an explicit `false` wins.
- **The `default` role** fills in the options that none of the user's other roles set, so it can hold defaults for everyone.
- **Options set nowhere** take the default from the table.

`showExtraVars`, with a capital V, is accepted as another spelling of `showExtravars`; when either spelling is `false`, the
option is off.

{: .warning }
> Treat `allowScheduledJobs` as an admin-level option. Schedules are not owned by the user who created them: every user with
> the option sees and can change all schedules. A schedule also runs with admin rights, for any form, whatever the creator's
> own access. Grant it only to roles you would trust as admins.

{: .warning }
> `allowLogin: false` on the `default` role locks out every user whose other roles do not set `allowLogin: true`, including
> the admins. Grant it back on the roles that must sign in before you save.
