---
layout: default
title: Forms
nav_order: 2.8
has_children: true
has_toc: false
---

# Forms
{: .no_toc }

Define the forms your users fill in
{: .fs-6 .fw-300 }

---

Forms are the core of AnsibleForms. Each form is a web interface that collects user input and runs an Ansible playbook or an AWX/Tower template with that data.

Forms are defined in YAML files in the forms folder. Each YAML file contains either a single form or a list of forms, and subfolders can be used to organize them.

**VIDEO**: [Create your first form](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

## Understanding Form Structure

Every form in AnsibleForms is configured with a set of properties. **[Common properties](common.html)** lists the properties that apply to all form types; the type-specific pages describe the additional ones.

## How forms are loaded

AnsibleForms loads forms from the following locations:

1. **FROM REPOSITORIES** : all repositories with the "use for forms" switch enabled (multiple repositories are supported)
   - Forms from all enabled repositories are merged automatically.
   - Each repository is first checked for a `forms/` subfolder.
   - If no `forms/` subfolder exists, the repository root is used.

2. **FROM LOCAL FOLDER** : the local `forms/` folder (FORMS_FOLDER_PATH environment variable), when no repositories are configured

{: .warning }
> **Note:** When "use for forms" is enabled on multiple repositories, all their forms are merged. Form names must be unique across repositories to avoid conflicts.

## Form properties

The following pages describe the form properties in detail:

- **[Common properties](common.html)** — properties that apply to all form types (`name`, `description`, `help`, `type`, `fields`)
- **[Ansible forms](ansible.html)** — properties specific to `type: ansible`
- **[AWX forms](awx.html)** — properties specific to `type: awx`
- **[Multistep forms](multistep.html)** — properties specific to `type: multistep`
- **[Wizard](wizard.html)** — split a form's input across multiple pages (works on top of any executable form type)
- **[Subform](subform.html)** — subforms use only the common properties
- **[Approval Points](approval.html)** — pause a job until it is approved (`approval`)
- **[Notifications](notifications.html)** — send emails on job status or events (`notifications`)
- **[Job Status Actions](job-status-action.html)** — act on the form when a job changes status (`onSubmit`, `onSuccess`, ...)
