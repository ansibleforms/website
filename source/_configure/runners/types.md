---
layout: default
title: Runner types
parent: Runners
nav_order: 2
---

# Runner types
{: .no_toc }

The products a runner can be, their address and login
{: .fs-6 .fw-300 }

The **Type** step offers one choice per product, each with a hint; the RTE's spells out its name, *Runtime Environment*. AAP and
Ascender are stored as a runner of type `awx` with a flavour (`aap` or `ascender`), which is also what the config seed uses:

| Type | Uri example | Project | Authentication |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | The `RTE_TOKEN` of the RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | An API token, or a user and password |
| Ascender | `https://ascender.example.com/api/v2` | | An API token, or a user and password |
| AWX | `https://awx.example.com/api/v2` | | An API token, or a user and password |
| Jenkins | `https://jenkins.example.com` | The folder the jobs are in (optional) | A user and that user's API token |
| Rundeck | `https://rundeck.example.com` | The project name | A user's API token |
| Semaphore | `https://semaphore.example.com` | The project id, the number in `/project/<id>` | A user's API token |

An AWX, AAP or Ascender address carries its API path: `/api/v2`, or `/api/controller/v2` for AAP 2.5 and later.
An RTE is the AnsibleForms image started with `AF_ROLE=rte`; how to run one is described in
[Runtime environments](../rte/).
