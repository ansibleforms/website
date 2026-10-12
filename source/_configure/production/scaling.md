---
layout: default
title: Scaling
parent: Running in production
nav_order: 4
---

# Scaling
{: .no_toc }

The RTE that runs the playbooks, and AnsibleForms split over several app nodes, a worker and more RTEs
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

AnsibleForms 7 runs no playbook in the app container. The job of an `ansible` form is handed to a [runner](../runners.html) of type
`rte`, a runtime environment: the AnsibleForms server started with `AF_ROLE=rte`, next to python and ansible. It is a small API
without a web interface. It claims the job in the database, runs `ansible-playbook`, and writes the output and the final
status back to the database, where the browser reads them.

The app resolves the job's credentials and hands them to the RTE sealed for that RTE and that job only. The RTE never reads the
credentials table nor a secret store, and a playbook does not inherit AnsibleForms' own environment variables
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` and the others): pass such a value as an extravar or a credential.

### The RTE images
{: .no_toc }

The RTE is published in three layers, each built on the one before, with the same tags as the app (see [Image tags](../installation/#image-tags)):

| Image | What is in it | Use it |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js and the AnsibleForms server, git, ssh and sshpass. No python and no ansible, so it runs no playbook by itself | To build an RTE with your own python and ansible versions |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | The base, plus python 3.14, ansible-core and a few common libraries (`jmespath`, `netaddr`, `requests`, `paramiko`). No collections | To build a smaller RTE with only the collections and libraries your playbooks use |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | The core, plus the `ansible` package on the same ansible-core, and what the AnsibleForms 6.5 image had: the NetApp, AWS and community collections, `pandas`, `pyvmomi`, `boto3`, the mariadb client, ytt and a few os tools | **The default.** Run it as it is: playbooks from 6.5 find what they used |

Like the app image, every layer runs as the user `node` (uid 1000), and the playbooks run as that user too.

### Build your own RTE
{: .no_toc }

Build on `ansibleforms-rte-core` and add the collections and python libraries your playbooks use. This NetApp example is one of
the Dockerfiles in [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

The python environment and the collections folder belong to `node`, so these installs need no root. A layer that installs os
packages switches to `USER root` for them and back to `USER node` at the end. To bring your own python and ansible, build on
`ansibleforms-rte-base` (`Dockerfile.own-ansible` in the same folder).

Keep the image on the app's release: `:7` follows the app's `:7`, and an exact `7.x.y` pins both. What the app and an RTE must
share is their contract, a number both report: 7.0.0 brought contract 2, so an RTE of an older 7 release keeps working with a newer
app as long as both still speak contract 2. When a release changes the contract, its release notes say that RTEs must be updated,
the RTE refuses the app's jobs, and **Test connection** on the runner and the **Status** page show it in red.

Collections and roles can also be mounted instead of baked in, at `/etc/ansible/collections` and `/etc/ansible/roles`. Then no
rebuild is needed per change, but what runs depends on that volume; python libraries always go into the image. Baking everything
in is reproducible and starts fast, which makes it the way for production.

### Run an RTE
{: .no_toc }

An RTE needs the app's database settings, a token, and the address the app reaches it on:

| Variable | Meaning |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | The app's own values: the RTE reads its jobs from the database and writes their output there |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | The bearer token every call to the RTE must carry, at least 16 characters; the RTE refuses to start without it |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | The address the app calls the RTE on, such as `http://rte:8000`. The runner is named after its host (`rte`), so forms can use `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | `1` (default): the RTE adds itself under **Connections > Runners** at its start, and the first one becomes the default runner. `0`: add it there yourself, or in the [config seed](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | The app's own value, needed only to register itself (the runner's token is stored encrypted); leave it out with `RTE_REGISTER=0` |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | How many playbooks it runs at once, `10` by default (`0` sets no limit). A job for a full RTE waits until a playbook ends |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | On a stop, how long it waits for its running playbooks, `25` by default; the ones still running then end as abandoned |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | Read by the app nodes and the worker, not the RTE: how long a job waits for a full or stopping RTE, `60` by default |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | The playbooks folder and the output limit: read by the RTE, so set them in its environment |

Without `RTE_URL` the RTE registers its IP address and port under the name `rte-<hostname>-<port>`, which change when the container is
recreated: set `RTE_URL` in production. A runner the RTE registered shows as *automatic* on the Runners page, and as *unresponsive* once
the RTE stopped answering; the worker removes it 10 minutes later.

The RTE runs the playbooks from its own disk, so mount the app's persistent volume (playbooks, repositories, uploads) and its ssh
folder on it too. A Docker example, with the app reachable as `ansibleforms` on the same network:

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Keep the RTE off the public network: its API answers any caller that has the token. `docker stop` waits only 10 seconds before it kills
a container, so give the RTE a longer stop timeout (`--stop-timeout`, or `stop_grace_period` in compose) or lower `RTE_DRAIN_SECONDS`.
Kubernetes waits 30 seconds by default.

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

A job running on an RTE belongs to that RTE, and carries on when the app node that started it goes. Any other job (an AWX job, or the
steps of a multistep form) belongs to the app node that started it. A container that restarts ends its own unfinished jobs, and the
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
