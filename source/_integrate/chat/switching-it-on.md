---
layout: default
title: Switching it on
parent: Chat assistant
nav_order: 1
---

# Switching it on
{: .no_toc }

Enable the assistant and offer forms in it
{: .fs-6 .fw-300 }

---

The assistant requires all four of the following:

1. **`ENABLE_CHAT=1`** - the environment variable; a restart is required. See [customization](../customization).
2. **A model provider** - Settings -> Connections -> **Chat assistant** (or the [config seed](../seed) on Kubernetes).
3. **Forms that take part** - `enableForChat: true` on each form; the assistant ignores all others.
4. **Users who may use it** - the role option `allowChat` (default: true). Set
   `allowChat: false` on a role to exclude its members.

The chat button appears for a user once all four conditions are met.
