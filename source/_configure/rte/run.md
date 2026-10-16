---
layout: default
title: Run an RTE
parent: RTE
nav_order: 2
---

# Run an RTE
{: .no_toc }

The settings an RTE needs, and how to start one next to the app
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Settings

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

---

## Start it

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

To run an RTE on another host or in another datacenter, follow [Another datacenter](another-datacenter.html).
