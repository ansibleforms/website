---
layout: default
title: Concepts
nav_order: 3
---

# Concepts
{: .no_toc }

The terms used across this documentation, each linked to its page
{: .fs-6 .fw-300 }

---

## Glossary

The terms used across this documentation:

| Term | Meaning |
|---|---|
| **[Form](forms/)** | A YAML definition that collects input and runs a playbook, a template or a series of steps |
| **[Form field](formfields/)** | One input of a form, such as `text`, `enum` or `checkbox`; its value becomes an extravar |
| **[Category](config/categories.html)** | A group in the tree of forms shown on the Forms page, defined in `config.yaml` |
| **[Role](config/roles.html)** | A set of users and groups; a form lists the roles that may see and run it |
| **[Expression](expressions/)** | JavaScript that computes a field value, in the browser (`runLocal: true`) or on the server |
| **[Extravars](formfields/)** | The variables sent to the playbook or template, built from the field values |
| **[Credential](expressions/credentials.html)** | A stored user and password (and host, port, database), encrypted with `ENCRYPTION_SECRET` |
| **[Secret store](secret-stores/)** | A connection to HashiCorp Vault or CyberArk that supplies a credential's user and password |
| **[Job](gui/forms-and-jobs.html)** | One run of a form, with its status, extravars and output, kept in the job history |
| **[Approval point](forms/approval.html)** | A pause in a job until a user with an approval role approves or rejects it |
| **[Multistep form](forms/multistep.html)** | A form that runs several playbooks or templates in sequence, from one set of fields |
| **[Subform](forms/subform.html)** | A reusable set of fields that describes the rows of a `list` field or the object of a `yaml` field |
| **[config.yaml](config/)** | The file with the categories, the roles and the constants; the forms live in their own files |
| **[Config seed](seed/)** | A YAML file (`CONFIG_SEED_PATH`) that declares the admin objects, such as AWX connections and credentials |
| **[Persistent folder](customization/paths.html)** | The folder that holds the files AnsibleForms must keep across restarts and upgrades |
