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

## Role object

Each entry of the `roles` list:

{% include config_object.html name="Role" %}

---

## Role options

The `options` of a role switch features on or off for its members; the table lists every option with its default.

| Option | Allows the user to | Default |
|---|---|---|
| `showSettings` | See the settings pages | Admins only |
| `showDesigner` | See and use the designer | Admins only |
| `showLogs` | See the server log | Admins only |
| `showJobs` | See the jobs page | On |
| `showDebugButtons` | See the debug buttons on a form | On |
| `allowJobRelaunch` | Relaunch a job with the form data of an earlier run | Admins only |
| `allowVerboseMode` | Run jobs in verbose mode | On |
| `allowScheduledJobs` | Create and manage recurring and one-time schedules, on the **Schedules** page (see the warning below) | Admins only |
| `allowStoredJobs` | Store the data of a form and load it again later | On |
| `allowPlannedJobs` | Plan a job to run once at a set time (**Run Later (One-time)**) | On |
| `showAllJobLogs` | See the jobs of every user, not only their own | Admins only |
| `showArtifacts` | See the artifacts an AWX job returns | On |
| `showExtravars` | See the extravars of a form and of a job | On |
| `allowLogin` | Sign in to AnsibleForms | On |
| `allowBackupOps` | Back up and restore the database | Admins only |
| `allowChat` | Use the [chat assistant](../chat/), when it is enabled | On |
| `extendedTokenExpiration` | Request a longer-lived token, such as an [API token](../profile/api-token.html) for scripts | Off |

**Admins only** means on for users who hold the `admin` role, and off for everyone else. When a user matches several roles,
the options are combined as follows:

- **Between the user's roles**, an option is on only when every role that sets it agrees: an explicit `false` wins.
- **The `public` role** fills in the options that none of the user's other roles set, so it can hold defaults for everyone.
- **Options set nowhere** take the default from the table.

`showExtraVars`, with a capital V, is accepted as another spelling of `showExtravars`; when either spelling is `false`, the
option is off.

{: .warning }
> Treat `allowScheduledJobs` as an admin-level option. Schedules are not owned by the user who created them: every user with
> the option sees and can change all schedules. A schedule also runs with admin rights, for any form, whatever the creator's
> own access. Grant it only to roles you would trust as admins.

{: .warning }
> `allowLogin: false` on the `public` role locks out every user whose other roles do not set `allowLogin: true`, including
> the admins. Grant it back on the roles that must sign in before you save.
