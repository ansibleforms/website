---
layout: default
title: Several RTEs
parent: RTE
nav_order: 3
---

# Several RTEs
{: .no_toc }

How many playbooks one RTE runs, more RTEs as runners or replicas, and what happens when one stops or dies
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Several jobs on one RTE

One RTE runs up to [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks side by side, 10 by
default (`0` sets no limit). A job for a full RTE is not claimed: the RTE answers `503`, and the app writes
`Waiting for a free slot on RTE <name>` once in the output and asks again every 10 seconds, for
[`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) at most (60 by default). Then the job fails. A job aborted
while it waits ends `aborted` without ever reaching the RTE.

---

## Several RTEs

The app does not spread jobs over runners by itself: every job goes to one runner, the one the form names or the
default. More RTE containers help in two ways:

* **As runners of their own** : each RTE has its own `RTE_URL` and adds itself as a runner of its own. The first one is the default,
  and a form picks another one with `runner: <name>`, for example an RTE with the VMware collections, or one in another network zone
* **As replicas behind one address** : several RTE containers with the same `RTE_URL` and the same `RTE_TOKEN`, such as the pods behind
  a Kubernetes Service, share one runner, and the address spreads the calls over them. A full replica answers `503`, and the next try
  may land on another one. The app follows a job through the database, so it does not matter which replica answers its status calls

Every RTE writes a heartbeat in the database every 10 seconds, and one that registers itself checks its runner row every 30 seconds.
The **Status** page lists every RTE with its version. On the **Runners** page a runner the RTE registered shows as *automatic*, and
as *unresponsive* once its heartbeat is two minutes old; the worker removes it after 10 minutes without a heartbeat. When the default
runner is a registered row whose RTE stopped, the next RTE that checks takes the default. A runner from the config seed or added by
hand is never removed.

---

## When an RTE stops or dies

**When an RTE stops.** On `SIGTERM` (`docker stop`, a rolling update, a scale down) the RTE stops taking jobs: `/ready` answers `503`,
and new jobs get `503` too, so the app waits or the address sends them to another replica. The running playbooks get
[`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) to finish, 25 by default, then the RTE exits.

**When an RTE dies.** A killed container (out of memory, a lost node, the end of the stop timeout) takes its playbooks with it: nothing
moves them to another RTE, and nothing runs them again. Their jobs are ended as `abandoned`, by the RTE itself when it comes back under
the same name, which a restarted container keeps (`rte-<hostname>-<port>`), or by the worker, once the RTE's heartbeat is two minutes
old. Check on the managed hosts what the playbook did before you launch it again. While the RTE is down, a new job for it fails at
once with *the RTE at ... is unreachable*, unless another replica answers at its address.
