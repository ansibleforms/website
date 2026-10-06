---
layout: default
title: Features
parent: Environment Variables
nav_order: 4
---

# Features
{: .no_toc }

The designer, MCP, chat, launch validation, the AWX API and query logging
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Change these to switch optional parts of the application on or off.

---

## Example

Serve the MCP server for AI agents and enforce the form validation rules on every launch. In the compose project's `.env`:

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` needs a restart. Run `LAUNCH_VALIDATION=log` for a while first: it logs what `enforce` would refuse without refusing
it. See [MCP](../mcp/) and [Log and enforce](../launch-validation/log-and-enforce.html).

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="features" %}
