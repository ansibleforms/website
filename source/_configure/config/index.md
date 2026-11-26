---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
---

# config.yaml
{: .no_toc }

Categories, roles and constants for all forms
{: .fs-6 .fw-300 }

---

For administrators: the config.yaml file that holds the categories, roles and constants shared by all forms.

AnsibleForms uses a config.yaml file to configure categories, roles and constants. If no file is provided, one is generated with a minimal configuration. The configuration can also be imported into the database, which removes the need for a config.yaml file, and each of the three can be kept in a git repository.

---

## Overview

The config.yaml file contains the configuration for categories, roles, and constants used by AnsibleForms.

**VIDEO**: [Create your first form](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

The following minimal config.yaml serves as a starting point. It contains only the required `Default` category and the required `admin` and `default` roles.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Configuration Loading Priority

Since 7.8.0 the categories, the roles and the constants are read each on its own, from the first source below that holds it.

1. **FROM A REPOSITORY** : the repository with the **Categories**, **Roles** or **Constants** usage type, from its file giving
   `controller_categories:`, `controller_roles:` or `controller_constants:`, any name and any folder (see
   [Configuration in git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **FROM THE REPOSITORY'S config.yaml** : the plain key in the `config.yaml` of that repository, deprecated since 7.8.0 and no
   longer read in 8.0; the server log, the pull output and the repository's page say so
3. **FROM DATABASE** : the configuration imported into the database, only when `ENABLE_CONFIG_IN_DATABASE=1`, or when that
   variable is unset and the configuration source stored in the database is `database` (an empty copy falls back to the file)
4. **FROM LOCAL FILE** : the local `config.yaml` file (CONFIG_PATH environment variable)

{: .warning }
> **Note:** The **Use for config** switch is gone since 7.8.0. An upgrade gives **Roles**, **Categories** and **Constants** to
> the repository that had it, and `use_for_config` in the config seed or the API is a deprecated alias of the three.

---

## In this section

The file has three top-level attributes, and each has a page of its own:

| Page | What it covers |
|---|---|
| [Categories](categories.html) | Group the forms on the dashboard in a tree of categories with icons |
| [Roles](roles.html) | Map users and groups to roles, and set what each role may do |
| [Constants](constants.html) | Free objects that every form can reuse |
