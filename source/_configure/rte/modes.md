---
layout: default
title: Modes
parent: RTE
nav_order: 2
---

# How an RTE talks to the app
{: .no_toc }

Outbound, inbound or database: who opens the connection, and what goes over it
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: since 7.3.0 an RTE talks to the app over one WebSocket and holds no database credentials. Pick the mode
that fits the network between them: who may open a connection to whom, and through which proxies and firewalls it passes.

---

## The three modes

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) on the RTE says how it reaches the app; its runner has the same **Mode**:

| Mode | Who opens the connection | What the RTE holds | For |
|---|---|---|---|
| `outbound` | The RTE dials the app at [`APP_URL`](../customization/server.html#env_APP_URL) and keeps one WebSocket open | Its `RTE_TOKEN`, no database credentials | A DMZ, NAT, or a zone that allows no incoming connections: nothing reaches the RTE from outside |
| `inbound` | The app dials the RTE at its runner's address and keeps one WebSocket open | Its `RTE_TOKEN`, no database credentials | A network where the central side opens every connection, a compose project, a pod |
| `database` (deprecated) | The app calls the RTE's API over HTTP, and the RTE reads and writes the app's database itself | The database's credentials (`DB_*`) and `ENCRYPTION_SECRET` | The behaviour of 7.0 to 7.2, removed in 8.0.0 |

An RTE without `RTE_MODE` runs in database mode all through 7.x, and logs a `[DEPRECATED] This RTE runs in database mode` warning at
its start. A runner added before 7.3.0 has the mode **Database (deprecated)**; set it to the mode its RTE runs in when you move it over.

---

## Outbound

The RTE opens the connection, so it works from a network that accepts no incoming connection at all:

* **The socket** : the RTE dials `APP_URL` with `/api/v2/rte/socket` added, over `wss://` (`ws://` for an `http://` address), with its
  `RTE_TOKEN` and its runner's name, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). It redials when the socket drops
* **The first time** : it asks to join, and its runner waits for an admin's approval under **Connections > Runners**, connected
  but without jobs (see [Asking to join](../runners/registration.html#asking-to-join)). A join token,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), approves it at once. From then on it signs in with its own token
* **The network** : only from the RTE's zone to the app, on the app's port, through a proxy when `HTTPS_PROXY` says so. A reverse
  proxy in front of the app must let the WebSocket through on that path (see [Runner WebSockets](../production/reverse-proxy.html#runner-websockets))
* **The certificate** : the app's certificate is checked. Name a private CA with `NODE_EXTRA_CA_CERTS`, or, inside one trusted network
  only, turn the check off with [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY)
* **The runner** : it needs no address, so its RTE credential holds the token only
* **Ready** : `/ready` answers `503` until the socket to the app is open

With several app nodes behind a load balancer, the node the RTE reaches holds its socket. Any node may launch a job: the node that holds
the socket sends it to the RTE, within two seconds when the job was launched on another node.

---

## Inbound

The RTE listens on its `PORT`, and the app dials it at its runner's address, with `/rte/v1/socket` added and the RTE's token. With
several app nodes, one at a time holds the socket of each inbound runner; when that node stops, another one takes over and dials again.

The app needs the RTE's runner before it can dial it: type RTE, mode **Inbound**, and an RTE credential with the RTE's address and its
`RTE_TOKEN`. It gets there in one of two ways:

| How | What to set |
|---|---|
| The RTE asks to join | `APP_URL` and [`RTE_URL`](../customization/server.html#env_RTE_URL) (the address the app dials). The RTE makes one call, `POST /api/v2/rte/register`, and its runner waits for an admin's approval: the app dials it once it is approved (see [Asking to join](../runners/registration.html#asking-to-join)). With `RTE_JOIN_TOKEN` it is approved at once. An inbound RTE with `APP_URL` but no `RTE_URL` refuses to start |
| You add the runner | No `APP_URL`: add the runner under **Connections > Runners**, or in the [config seed](../seed/), as in [Run an RTE](run.html#start-it) |

The Docker Compose project, the Helm chart and the installer's controller run their own RTE this way, inbound, declared by the seed.

**Over HTTPS.** With [`HTTPS=1`](../customization/server.html#env_HTTPS) the RTE serves its socket over TLS, with the key and certificate
of [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) and [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(`key.pem` and `cert.pem` in its `certificates` folder by default). An RTE with an `https://` `RTE_URL` sends that certificate when it
asks to join, and the app pins it: it dials the RTE only when it presents the same certificate, so a self-signed one works without a CA.
The RTE logs the certificate's fingerprint at its start (the first 8 hexadecimal digits of the SHA-256 of its DER bytes, as `abcd-ef12`),
and the approval dialog shows the one the app received: check that they match before you approve it.
The [installer](../installation/installer.html#a-runner) sets up its inbound Runners this way, with a certificate of their own address.

---

## Database (deprecated)

The RTE of 7.0 to 7.2: the app calls its API over HTTP, and the RTE claims the job in the database, writes the output there and keeps its
own runner row up to date, with [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [How the RTE runs](./#how-the-rte-runs)
describes it step by step. It still works in 7.x, with a warning at every start, and is removed in 8.0.0.

To move such an RTE to a socket mode:

1. Set `RTE_MODE=outbound` with `APP_URL`, or `RTE_MODE=inbound`, on the RTE
2. Remove `DB_*` and `ENCRYPTION_SECRET` from its environment, and `RTE_REGISTER`, which only database mode reads
3. Set its runner's **Mode** under **Connections > Runners**, or `rte_mode` in the config seed, or give it a join token
   (`RTE_JOIN_TOKEN`, see [Join tokens](../runners/registration.html#join-tokens))

---

## What goes over the socket

In both socket modes, the app sends the RTE each job with everything the RTE used to read in the database, and stores what comes back,
the output, the events, the job log and the end, exactly once. The app also sends the end notifications.

**The spool.** Every output batch, event batch, log, start and end is numbered and written to the job's spool file
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) before it is sent, and kept until the app says it stored it.
After a reconnect, to the same app node or another, the RTE sends again what was not acknowledged, and the app skips what it stored
already: nothing is lost, and nothing is stored twice. Keep the spool on a volume, so an RTE that restarts still sends what it had not
delivered. A playbook that was running when the RTE restarted cannot go on: its job ends as abandoned.

**Capacity.** The RTE runs up to [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks at once, and tells the app
every 20 seconds how many run. A job for a full RTE waits, as described in [Several RTEs](several.html#several-jobs-on-one-rte).

**The job's files.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES) says where the RTE gets the playbooks and the inventories:

| `RTE_FILES` | Where the files come from |
|---|---|
| `transfer` (default) | The app sends the playbooks folder and the inventories with the job, each packed and named by a hash of its content. The RTE keeps them under [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH), the 20 used last, and asks only for a hash it does not have: an unchanged folder is never sent twice. The RTE needs no shared disk and no access to the repositories |
| `local` | The RTE runs from its own folders, as a database-mode RTE: mount the playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) and the repositories ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) on it |

With `transfer`, a folder bigger than [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 by default, read by
the app) is not sent: the job fails and says to mount the folder on the RTE instead. The ssh folder is never sent: the RTE keeps its own
private key and `known_hosts` in `/home/node/.ssh`.

**Hosts and tasks.** Since 7.3.0, an RTE in any mode records a playbook's structured events next to its text output: each play, task and
host result, and the recap, written by its `af_events` callback plugin. The job page shows them under **Hosts and tasks** (see
[Following a job](../jobs/following.html#hosts-and-tasks)).

---

## Network

What to open between the app, the RTE and the managed hosts, per mode:

| Mode | From | To | Port |
|---|---|---|---|
| Outbound | The RTE | The app, at `APP_URL` | The app's port (`443` behind most proxies) |
| Inbound | The app nodes | The RTE, at its runner's address | The RTE's `PORT` (`8000`) |
| Database (deprecated) | The RTE, and the app nodes and the worker | The database, and the RTE | `3306`, and the RTE's `PORT` |
| Every mode | The RTE | The managed hosts | ssh (`22`), WinRM, their APIs |

In a socket mode the RTE never connects to the database. Its API answers the socket and the probes only: `/live`, `/ready`, `/metrics`.
