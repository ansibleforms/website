---
layout: default
title: config.yaml
nav_order: 2.75
has_children: true
has_toc: false
---

# config.yaml
{: .no_toc }

Categories, roles and constants for all forms
{: .fs-6 .fw-300 }

---

AnsibleForms uses a config.yaml file to configure categories, roles and constants. If no file is provided, one is generated with a minimal configuration. The configuration can also be imported into the database, which removes the need for a config.yaml file.

---

## Overview

The config.yaml file contains the configuration for categories, roles, and constants used by AnsibleForms.

**VIDEO**: [Create your first form](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

The following minimal config.yaml serves as a starting point. It contains only the required `Default` category and the required `admin` and `public` roles.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: public
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Configuration Loading Priority

AnsibleForms loads the config.yaml file in the following order (first match wins):

1. **FROM DATABASE** : the configuration imported into the database, if any (highest priority)
2. **FROM REPOSITORY (use_for_config)** : the repository with the "use for config" switch enabled (new in 6.1.0)
3. **FROM REPOSITORY (use_for_forms)** : the repository with the "use for forms" switch enabled (fallback for backward compatibility)
4. **FROM LOCAL FILE** : the local `config.yaml` file (CONFIG_PATH environment variable)

{: .warning }
> **Note:** Enable "use for config" on only one repository. If several have it enabled, a warning is logged and the first one is used.

---

## Attributes

The file has three top-level attributes, and each has a page of its own:

* **[Categories](categories.html)** : group the forms on the dashboard in a tree of categories with icons
* **[Roles](roles.html)** : map users and groups to roles, and set what each role may do
* **[Constants](constants.html)** : free objects that every form can reuse
