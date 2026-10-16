---
layout: default
title: Scaling
parent: Running in production
nav_order: 4
---

# Scaling
{: .no_toc }

AnsibleForms split over several app nodes and a worker, next to one or more RTEs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Roles

Every AnsibleForms container runs the same server code, and [`AF_ROLE`](../customization/server.html#env_AF_ROLE) decides what it does:

| `AF_ROLE` | Image | Runs | How many |
|---|---|---|---|
| `all` (unset) | `ansibleforms` | The web app and the worker in one process: the default | 1 |
| `app` | `ansibleforms` | The web interface and the API | As many as you like, behind a load balancer |
| `worker` | `ansibleforms` | The background work: the database schema and its upgrades, the config seed, the schedules, the nightly backup, the repository syncs and the cleanups | One at work; more wait and take over |
| `rte` | `ansibleforms-rte-full` (or `-rte-core`, `-rte-base`) | The playbooks | As many as you like |

The smallest installation is one container without `AF_ROLE` next to one RTE: this is what the [Docker Compose project](../installation/docker-compose.html)
and the [Helm chart](../installation/kubernetes.html) run. Any other value of `AF_ROLE` stops the process at its start.

---

## The RTE

The RTE, the runtime environment that runs the playbooks, has its own section: [Runtime environments](../rte/). It covers how an RTE
runs a job, [its images](../rte/images.html), [how to run one](../rte/run.html), [several RTEs](../rte/several.html) as runners or
replicas, and [an RTE in another datacenter](../rte/another-datacenter.html).

---

## Several app nodes

To serve more users, or to survive the loss of one node, split the app into `app` nodes behind a load balancer and a `worker`.

### What the nodes share
{: .no_toc }

The nodes agree with each other through the database and a shared volume:

* **The database** : the jobs, the worker lock, the designer lock, the list of nodes and the change notices that keep every node's
  caches current. A credential, a runner or a schedule edited on one node is in force on all of them within 5 seconds
* **The persistent volume** (`/app/dist/persistent`) : forms, the config, repositories, uploads, backups and the managed `.env`.
  Every app node and the worker mount the same one, read-write
* **The ssh folder** (`/home/node/.ssh`) : the key and the known hosts for git over ssh; the worker creates the key at its first start
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : the same on every app node, or a token signed
  by one node is refused by the next. An app node refuses to start without it
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : the same on every container, or a credential
  stored by one cannot be read by another

Give every container the same database user, too: a waiting worker can end the session of a dead one only when it is its own.

### The worker lock
{: .no_toc }

Only one worker works at a time. It holds the database lock `ansibleforms_worker`; when it stops, the database releases the lock and a
waiting worker takes it within 10 seconds. When the worker's host dies without a goodbye, the database could keep the lock for hours,
so a waiting worker ends that session once no worker has written a heartbeat for two minutes, and takes over.

A worker that loses the lock to another one stops, and its container restarts as the one waiting. A worker whose start fails stops
too, so it never holds the lock doing nothing. Galera and group replication do not share the lock between database nodes: point every
worker at the same database node.

### Jobs and nodes
{: .no_toc }

Every container names itself `<role>-<hostname>-<port>`, with nothing to set, and the **Status** page lists them all with their role
and version, which one is the worker, and a warning when they run different versions.

A job running on an RTE belongs to that RTE, and carries on when the app node that started it goes. Any other job (a template job
on AWX or another runner, a workflow job, or the steps of a deprecated multistep form) belongs to the app node that started it. A container that restarts ends its own unfinished jobs, and the
worker ends the jobs of a container that stopped answering for two minutes, such as a replaced pod.

A `SIGHUP` sent to any node re-applies the [config seed](../seed/): an app node asks the worker to do it.

### Upgrading
{: .no_toc }

Upgrade the **worker first**, then the app nodes. The worker patches the schema, and an app node of the new version waits until the
schema is patched and logs what it waits for. App nodes upgraded first stay unready until the worker follows, while the old ones keep
serving. RTEs can follow at any time, as long as they speak the same contract.

### Limits
{: .no_toc }

A few things stay with one node:

* **The chat assistant** keeps its conversations in the memory of one app node: use sticky sessions on the load balancer (nginx
  `ip_hash`), or a single app node
* **Logs** stay in each container. Set [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) off the shared volume, because several
  processes rotating one file lose lines. The log viewer shows the log of the node that answers, so collect the logs centrally
* **Settings** changed on the settings pages are written to the managed `.env` on the shared volume and apply on every node; the ones
  that need a restart need it on every node

---

## Example layout

The app repository has a complete starting point in [examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale):

| Service | Image | Role |
|---|---|---|
| `db` | `mariadb:11` | The database, with a user that has rights on the `AnsibleForms` schema only |
| `app1`, `app2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=app`, behind the load balancer |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: the second one waits and takes over |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Runs the playbooks, registered as the runner `rte` (`RTE_URL=http://rte:8000`) |
| `lb` | `nginx:stable` | Terminates HTTPS on port 8443 and spreads the browsers over the app nodes with `ip_hash` |

Every AnsibleForms container shares one `.env`, with the database user, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`HTTPS=0` behind the load balancer and a `LOG_PATH` off the shared volume. The app nodes, the workers and the RTE mount the same
persistent and ssh volumes:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```
