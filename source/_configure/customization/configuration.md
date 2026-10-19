---
layout: default
title: Configuration
parent: Environment Variables
nav_order: 5
---

# Configuration
{: .no_toc }

The config seed, where the configuration is kept, git and ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Change these to decide where the configuration comes from: a config seed, the database, git or ytt templates.

---

## Example

Apply a mounted config seed, check it every five minutes, and keep `config.yaml` in the database. In `docker-compose.yml`:

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - CONFIG_SEED_RELOAD_SECONDS=300
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

An invalid seed stops the server from starting. See [Config seed](../seed/) for the file format.

---

## Where config.yaml is read from

The categories, roles and constants come from `config.yaml` on disk or from its copy in the database, decided in this order:

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), when it is set, in the environment or on the
   **Configuration** tab of the settings page: `1` reads the database, `0` reads the file.
2. Otherwise, the configuration source stored in the database (`file` or `database`), which instances set up
   before 6.3.0 chose on the settings page.
3. Otherwise, the file: the `config.yaml` of the repository with **Use for config** enabled, else of a repository with
   **Use for forms** enabled, else the one at [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

An explicitly set `ENABLE_CONFIG_IN_DATABASE` always wins, even `0` over a stored `database`. It is read each time the
configuration loads, so a change applies without a restart. The **Status** page shows the source in use on its **Information** tab.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="configuration" %}
