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

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="configuration" %}
