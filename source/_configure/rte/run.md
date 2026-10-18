---
layout: default
title: Run an RTE
parent: RTE
nav_order: 3
---

# Run an RTE
{: .no_toc }

The settings of each mode, and how to start an RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Settings

What an RTE needs depends on its mode (see [Modes](modes.html)). Every RTE reads these:

| Variable | Meaning |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Since 7.3.0: `outbound` (it dials the app), `inbound` (the app dials it) or `database` (deprecated, the default throughout 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | The token between the app and the RTE, at least 16 characters; the RTE refuses to start without it |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | How many playbooks it runs at once, `10` by default (`0` sets no limit). A job for a full RTE waits until a playbook ends |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | On a stop, how long it waits for its running playbooks, `25` by default; the ones still running then end as abandoned |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | Read by the app nodes and the worker, not the RTE: how long a job waits for a full or stopping RTE, `60` by default |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | The playbooks folder and the output limit: read by the RTE, so set them in its environment |

An RTE in a socket mode, `outbound` or `inbound`, also reads these, and no `DB_*` and no `ENCRYPTION_SECRET`:

| Variable | Meaning |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | The app's address as people open it, such as `https://forms.example.com`. Outbound: the address it dials. Inbound: the address of its one registration call |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` (default): the app's certificate must be valid. `0` accepts any, inside one trusted network only |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Its runner's name, which forms name with `runner:`. Not set: its node id, `rte-<hostname>-<port>`, which changes with the container: set it in production |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Optional, the first time only: a join token, made through the API, which approves its runner at once instead of waiting for an admin (see [Join tokens](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Inbound, when it asks to join: the address the app dials, such as `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (default): the app sends the playbooks and inventories with the job. `local`: it runs from its own mounted folders |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | Where each job's output, events and end wait until the app stored them, `<persistent>/rte-spool` by default: keep it on a volume |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | With `transfer`: where the folders the app sent are kept, `<persistent>/rte-files` by default |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | Read by the app, not the RTE: the largest folder it sends with `transfer`, `512` by default |

An RTE in database mode (deprecated) reads the database settings instead, and registers itself:

| Variable | Meaning |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | The app's own values: the RTE reads its jobs from the database and writes their output there |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | The address the app calls the RTE on, such as `http://rte:8000`. The runner is named after its host (`rte`), so forms can use `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | `1` (default): the RTE adds itself under **Connections > Runners** at its start, and the first one becomes the default runner. `0`: add it there yourself, or in the [config seed](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | The app's own value, needed only to register itself (the runner's token is stored encrypted); leave it out with `RTE_REGISTER=0` |

In database mode, without `RTE_URL` the RTE registers its IP address and port under the name `rte-<hostname>-<port>`, which change when
the container is recreated: set `RTE_URL` in production. Once the RTE has not answered for two minutes its runner counts as
unresponsive, and the worker removes it 10 minutes after its last answer.

---

## Start it

The RTE runs the playbooks, so it needs its ssh folder, with the private key and the `known_hosts` the playbooks use, and a persistent
folder for its spool and the files the app sends. Pick the mode:

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">Outbound</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">Inbound</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Database (deprecated)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Start the RTE on any host that reaches the app, with its own token and the name its runner gets:

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

It dials the app and asks to join: **Connections > Runners** lists the runner `rte-dmz`, **Waiting for approval**, and its log shows
the fingerprint of its token. Check that its page shows the same fingerprint, then **Approve** it (see
[Approving an RTE](../runners/registration.html#approving-an-rte)): it takes jobs from then on, signing in with its own `RTE_TOKEN`.
For an unattended start, add `-e RTE_JOIN_TOKEN=<a join token, afj_...>`, which approves it at once. Nothing needs to reach this
host: publish no port. Only `/live`, `/ready` and `/metrics` listen on its `PORT`, for the probes.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Start the RTE where the app reaches it. This one runs next to the app, on the same network, and runs the playbooks from the app's own
folders (`RTE_FILES=local`):

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Then give the app its runner. In the [config seed](../seed/), an RTE credential with the address and the token, and a runner in
inbound mode that signs in with it:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

Or add the same two by hand: the credential under **Connections > Credentials**, type RTE, and the runner under
**Connections > Runners**, type RTE, mode **Inbound**, with that credential. To let the RTE ask to join instead, start it with
`APP_URL` and `RTE_URL`, and approve it under **Connections > Runners** (see [Inbound](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Deprecated since 7.3.0 and removed in 8.0.0. The RTE runs the playbooks from its own disk, so mount the app's persistent volume
(playbooks, repositories, uploads) and its ssh folder on it too. A Docker example, with the app reachable as `ansibleforms` on the
same network:

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Keep an inbound RTE off the public network: its socket answers any caller that has the token. `docker stop` waits only 10 seconds before
it kills a container, so give the RTE a longer stop timeout (`--stop-timeout`, or `stop_grace_period` in compose) or lower
`RTE_DRAIN_SECONDS`. Kubernetes waits 30 seconds by default.

The [installer](../installation/installer.html) sets up an outbound or inbound RTE on a server of its own, with Docker, Podman or
[without containers](../installation/native.html), and prints the fingerprint to approve it by. To run an RTE in another datacenter
by hand, follow [Another datacenter](another-datacenter.html).
