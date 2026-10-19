---
layout: default
title: Forms
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
---

# Forms
{: .no_toc }

Define the forms your users fill in
{: .fs-6 .fw-300 }

---

For form authors: how forms are written in YAML, where they are loaded from, and the properties of each form type.

Forms are the core of AnsibleForms. Each form is a web interface that collects user input and, with that data, runs an
Ansible playbook, an AWX, AAP or Ascender template, a Semaphore template, a Rundeck or Jenkins job, or a
[workflow](../workflows/).

Forms are defined in YAML files in the forms folder. Each YAML file contains either a single form or a list of forms, and subfolders can be used to organize them.

**VIDEO**: [Create your first form](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## Understanding Form Structure

Every form in AnsibleForms is configured with a set of properties. **[Common properties](common.html)** lists the properties that apply to all form types; the type-specific pages describe the additional ones.

---

## How forms are loaded

AnsibleForms loads forms from the following locations:

1. **FROM REPOSITORIES** : all repositories with the "use for forms" switch enabled (multiple repositories are supported)
   - Forms from all enabled repositories are merged automatically.
   - Each repository is first checked for a `forms/` subfolder.
   - If no `forms/` subfolder exists, the repository root is used.
   - Forms created in the designer and not pushed yet are kept in a staging folder
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) and loaded with them.

2. **FROM LOCAL FOLDER** : the local `forms/` folder
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), when no repository has "use for forms" enabled

{: .warning }
> **Note:** When "use for forms" is enabled on multiple repositories, all their forms are merged. Form names must be unique across repositories to avoid conflicts.

---

## Where a form runs

A form's type decides the kind of [runner](../runners.html) its job runs on: an RTE for `ansible`, an AWX runner for `awx`,
`aap` and `ascender`, and a runner of its own type for `semaphore`, `rundeck` and `jenkins`.

- `runner: <name>` on the form picks a runner of that type by name; without it, the job runs on the default runner of the type.
- A runner disabled under **Connections > Runners** fails the job, whether the form names it or it is the default. The job
  never falls back to another runner.
- When one of the user's roles lists `runners` in `config.yaml`, the job may only run on a runner such a role lists, or it is
  refused. Roles without the list do not limit it, and an admin is never limited.

---

## In this section

The following pages describe the form properties in detail:

| Page | What it covers |
|---|---|
| [Common properties](common.html) | Properties that apply to all form types (`name`, `description`, `help`, `type`, `fields`) |
| [Ansible forms](ansible.html) | Properties specific to `type: ansible` |
| [AWX forms](awx.html) | Properties specific to `type: awx` |
| [Semaphore forms](semaphore.html) | Properties specific to `type: semaphore`, which runs a Semaphore template |
| [Rundeck forms](rundeck.html) | Properties specific to `type: rundeck`, which runs a Rundeck job |
| [Jenkins forms](jenkins.html) | Properties specific to `type: jenkins`, which builds a Jenkins job |
| [Multistep forms](multistep.html) | Properties specific to `type: multistep`, deprecated in favour of `workflow` |
| [Workflow forms](workflow.html) | Properties specific to `type: workflow`, which runs a [workflow](../workflows/) |
| [Wizard](wizard.html) | Split a form's input across multiple pages (works on top of any executable form type) |
| [Subform](subform.html) | Subforms use only the common properties |
| [Approval Points](approval.html) | Pause a job until it is approved (`approval`) |
| [Notifications](notifications.html) | Send emails and channel messages on job status or events (`notifications`) |
| [Job Status Actions](job-status-action.html) | Act on the form when a job changes status (`onSubmit`, `onSuccess`, ...) |
