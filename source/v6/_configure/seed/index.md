---
layout: default
title: Config seed
nav_order: 3
has_children: true
has_toc: false
---

# Config seed
{: .no_toc }

Declare the admin objects in a file
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Declare the admin objects in a file instead of creating them in the interface, so that a whole
instance can be rebuilt from git on an empty database.

---

## What it covers

Set `CONFIG_SEED_PATH` to a YAML file, and AnsibleForms applies it at startup. The file
declares objects that previously existed only in the database:

| Section        | What it declares                     |
|----------------|--------------------------------------|
| `awx`          | AWX / AAP connections                |
| `credentials`  | Credentials                          |
| `oauth2`       | OAuth2 providers                     |
| `repositories` | Git repositories                     |
| `ldap`         | The LDAP configuration               |
| `settings`     | The mail settings and the public URL |
| `chat`         | The chat assistant's model provider  |

The seed is **not** the same as `config.yaml`, which holds the categories, roles and constants
and has its own `CONFIG_PATH`. The two are kept separate on purpose: the
repository that *holds* `config.yaml` is one of the objects the seed declares, so the seed
cannot live inside it.

Users and groups are left out: they come from LDAP or OAuth2, and the first admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

---

## In this section

Each topic has a page of its own:

* **[Example](example.html)** : a complete seed file, section by section
* **[Managed objects](managed-objects.html)** : how the seed owns the objects it lists, and how it keeps secrets out
* **[Reloading and startup](reloading.html)** : change the file without a restart, and what happens at startup
* **[Kubernetes](kubernetes.html)** : provision AnsibleForms from a ConfigMap and Secrets
* **[Editing and audit](environment-and-audit.html)** : lock the settings pages, and what the audit log records
