---
layout: default
title: Several RTEs
parent: RTE
nav_order: 4
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
default (`0` sets no limit). A job for a full RTE is not claimed. In a socket mode the app does not send it while the RTE's last
health report shows no free slot, and an RTE that is full or stopping answers `refused` as busy; in database mode the RTE answers
`503`. Either way the app writes `Waiting for a free slot on RTE <name>` once in the output and offers the job again every 10 seconds,
for [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) at most (60 by default). Then the job fails with
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. A job aborted while it waits ends `aborted` without ever
reaching the RTE.

---

## Several RTEs

The app does not spread jobs over runners by itself: every job goes to one runner, the one the form names or the
default. More RTE containers help in two ways:

* **As runners of their own** : each RTE has its own `RTE_NAME` and joins as a runner of its own: it asks to join and an admin
  approves it, or it presents a join token (see [Registration](../runners/registration.html)). A form picks one with `runner: <name>`,
  for example an RTE with the VMware collections, or one in another network zone; the others run on the default RTE
* **As replicas behind one address** (database mode only) : several RTE containers with the same `RTE_URL` and the same `RTE_TOKEN`,
  such as the pods behind a Kubernetes Service, share one runner, and the address spreads the calls over them. A full replica answers
  `503`, and the next try may land on another one. The app follows a job through the database, so it does not matter which replica
  answers its status calls

In a socket mode (see [Modes](modes.html)) a runner holds one socket to one RTE, and a second RTE that signs in with the same
`RTE_NAME` takes the socket over from the first. Give each RTE a name and a runner of its own, and let forms pick between them with
`runner:`.

Every RTE in database mode writes a heartbeat in the database every 10 seconds, and one that registers itself checks its runner row every
30 seconds. For an RTE in a socket mode, the app node that holds its socket writes the heartbeat for it every 20 seconds, while the
socket is open. The **Status** page lists every RTE with its version. The worker removes a runner an RTE in database mode registered
itself once that RTE has written no heartbeat for 10 minutes, and when the default runner is such a row whose RTE stopped, the next RTE
that checks takes the default. A runner from the config seed, added by hand or joined over a socket is never removed that way.

---

## When an RTE stops or dies

**When an RTE stops.** On `SIGTERM` (`docker stop`, a rolling update, a scale down) the RTE stops taking jobs: `/ready` answers `503`,
and a new job is refused as busy (`503` in database mode), so the app waits, or in database mode the address sends it to another
replica. The running playbooks get [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) to finish, 25 by default,
then the RTE exits.

**When an RTE dies.** A killed container (out of memory, a lost node, the end of the stop timeout) takes its playbooks with it: nothing
moves them to another RTE, and nothing runs them again. Their jobs are ended as `abandoned`, by the RTE itself or by the app when it
comes back under the same id, which a restarted container keeps (`rte-<hostname>-<port>`), or by the worker, once the RTE's heartbeat
is two minutes old. Check on the managed hosts what the playbook did before you launch it again.

**While an RTE is down.** In a socket mode a new job for it waits for its socket, up to `RTE_QUEUE_MINUTES` and one more minute, then
fails with *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
In database mode it fails at once with *the RTE at ... is unreachable*, unless another replica answers at its address.
