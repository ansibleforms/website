---
layout: default
title: Registration
parent: Runners
nav_order: 3
---

# Registration
{: .no_toc }

How an RTE adds itself, and when it is removed
{: .fs-6 .fw-300 }

The **Registration** column says how a runner got onto the page:

| Registration | Meaning |
|---|---|
| automatic | An RTE added itself when it started, and it is still answering. |
| unresponsive | An RTE that added itself has not answered for two minutes. Once it has been silent for ten minutes, the runner is removed. |
| manual | Added on this page or by the config seed. It is never removed automatically. |

An RTE registers itself by default, at its `RTE_URL` or else at its own address and port. To manage RTE runners
yourself, start the RTE with `RTE_REGISTER=0` and add it here with type RTE, its address and the same token.
