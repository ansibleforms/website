---
layout: default
title: Another datacenter
parent: RTE
nav_order: 5
---

# An RTE in another datacenter
{: .no_toc }

From a bare host in a second datacenter to an outbound RTE running its first playbook
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

For administrators: when the managed hosts of a second datacenter should be reached from an RTE in that datacenter, not from the first one.

{: .note }
> **The easy path.** The [installer](../installation/installer.html#a-runner) does every step below on the RTE host in one command:
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, with `--join afj_...` to have it approved at once.
> This runbook does the same by hand, with Docker or Podman, so you can see and adapt each part.

---

## What you end with

The app, its worker and its database stay where they are, in datacenter 1. Datacenter 2 gets a host that runs one RTE container in
outbound mode ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), see [Modes](modes.html#outbound)): it dials the app over
HTTPS and keeps one WebSocket open, joins as a runner of its own, and runs the playbooks of the forms that name it against the managed
hosts of datacenter 2.

| Where | What runs there | Talks to |
|---|---|---|
| Datacenter 1 | The app nodes, the worker, the database (as today) | Nothing new: it takes the RTE's socket on its usual HTTPS address |
| Datacenter 2, the RTE host | Docker or Podman, and the RTE container | The app at `APP_URL` over HTTPS, and the managed hosts of datacenter 2 |

The RTE holds no database credentials and no `ENCRYPTION_SECRET`, only a token of its own. Nothing connects to it, so it needs no open
port, no DNS name and no certificate. The app sends the playbooks and the inventories with each job (`RTE_FILES=transfer`, the
default), so the RTE needs no copy of them and no shared disk.

Every command below runs in a terminal on the RTE host, as a user with `sudo`, unless it says otherwise. It takes about 20 minutes,
most of it waiting for the image.

---

## 0. Before you start

Collect these:

| What | Where it comes from |
|---|---|
| The app's address | `APP_URL`: the address people open in a browser, such as `https://forms.example.com`, with its base path if it has one |
| The app's certificate | Signed by a public CA, a private CA (you need its certificate, step 6), or self-signed |
| A proxy | The `HTTPS_PROXY` this datacenter uses to reach datacenter 1, if any |
| The RTE's name | Its runner's name under **Connections > Runners**, which forms name with `runner:`, such as `rte-dc2`: letters, digits and `_ . : @ -` |
| A join token | Optional: a [join token](../runners/registration.html#join-tokens) (`afj_...`) approves the RTE at once. Without one, an admin approves it (step 8) |
| The ssh key | The private key the playbooks use to reach the managed hosts, or the right to create one |

The app must run 7.3.0 or later. To make a join token for this one RTE, an admin calls the API once (see
[Join tokens](../runners/registration.html#join-tokens)):

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. Prepare the host

The RTE is a container, so the host needs a container engine and nothing else: Node.js, python and ansible are in the image.

| Need | Why |
|---|---|
| Linux on **x86_64** (amd64) | The RTE images are published for amd64 only |
| 2 CPU and 4 GB of memory, or more | One RTE runs up to [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks at once (10), each with its forks: size it for them |
| 20 GB of free disk | The `-rte-full` image is about 3.3 GB, plus an image during updates, the job files the app sends and the jobs' temporary files |
| Docker, or Podman with podman-compose | To pull and run the image |
| The time set by NTP | The jobs' times are compared with the app's |

**Docker**, on Ubuntu or Debian (other distributions: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, on RHEL, Rocky or Alma Linux:

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

With Podman, write `podman` for `docker` and `podman-compose` for `docker compose` in every command below.

---

## 2. Network and firewall

The RTE opens every connection itself. Nothing reaches it from outside:

| From | To | Port | Why |
|---|---|---|---|
| The RTE host | The app, at `APP_URL` (through `HTTPS_PROXY` if set) | The app's port, `443` behind most proxies | The socket the jobs, their files and their output go over |
| The RTE host | The managed hosts of datacenter 2 | ssh (`22`), WinRM, their APIs | The playbooks run from here |
| The RTE host | `ghcr.io` | `443` | To pull the image, unless it comes from your own registry or a file (step 4) |

Open no incoming port for the RTE. Its `PORT` (`8000`) serves only `/live`, `/ready` and `/metrics`, for the probes on this host.

The RTE dials `APP_URL` with `/api/v2/rte/socket` added, as a WebSocket. A reverse proxy in front of the app must pass the upgrade on
for that path (see [Runner WebSockets](../production/reverse-proxy.html#runner-websockets)). Check from here that the app answers:

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Folders

Everything lives under `/opt/af-rte`. The RTE runs as the user `node` (uid 1000), so its data belongs to that uid:

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Folder | In the container | Holds |
|---|---|---|
| `data/` | `/app/dist/persistent` | The spool (`rte-spool`: each job's output and end until the app stored them), the job files the app sent (`rte-files`), a private CA, the python libraries a playbook installs |
| `data/ssh/` | `/home/node/.ssh` | The ssh key and `known_hosts` of the playbooks |
| `data/ansible/` | `/etc/ansible/...` | An `ansible.cfg`, roles and collections of your own, mounted instead of built in |

Keep `data/` on the host: a restarted RTE still sends what the app had not stored, and keeps its cache of job files.

**ssh key.** Copy the key the playbooks use in datacenter 1, or make one for this datacenter and give its public half to the managed hosts:

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Then give everything to uid 1000, with the key readable by its owner only:

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. The image

Pick one of the two.

### Option A: the official image
{: .no_toc }

The published images are on the GitHub Container Registry, public, no login needed (see [Images](images.html) for the three layers).
Take the same layer as datacenter 1. `:7` follows the latest 7 release, as the app's `:7` does:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

A host without internet access gets the image from one that has it:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

Or push it once to your own registry (`docker tag` and `docker push`), and use that name in the next steps.

### Option B: your own image
{: .no_toc }

When the playbooks of datacenter 2 need collections or python libraries the official image lacks (the VMware ones for this datacenter's
vCenter, for example), build on `ansibleforms-rte-core`:

```bash
sudo mkdir -p /opt/af-rte/build
sudo tee /opt/af-rte/build/Dockerfile >/dev/null <<'EOF'
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
# the collections and python libraries these playbooks use : no root needed, both belong to node
RUN ansible-galaxy collection install community.vmware -p /usr/share/ansible/collections \
 && pip install --no-cache-dir pyvmomi
EOF
docker build --pull -t af-rte-dc2 /opt/af-rte/build
```

Rebuild it on each new release of the app (see [Build your own RTE](images.html#build-your-own-rte)). With several RTE hosts, build
once and push to your own registry. Offline, `docker save` and `docker load` the built image as in option A.

---

## 5. Settings

A new [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) of its own, at least 16 characters. It is this RTE's password: the app
keeps it in the runner's RTE credential, and seals each job's secrets with it.

```bash
openssl rand -base64 24
```

```bash
sudo tee /opt/af-rte/rte.env >/dev/null <<'EOF'
RTE_MODE=outbound
APP_URL=https://forms.example.com
RTE_NAME=rte-dc2
RTE_TOKEN=<the new token>
# optional, the first time only : approved at once instead of waiting for an admin
RTE_JOIN_TOKEN=<afj_..., or remove this line>
PORT=8000
PYTHONPATH=/app/dist/persistent/python/lib
EOF
sudo chmod 600 /opt/af-rte/rte.env
```

| Variable | Meaning |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`: the RTE dials the app. Without it the RTE starts in the deprecated database mode |
| [`APP_URL`](../customization/server.html#env_APP_URL) | The app's address, `http://` or `https://`, with its base path if any |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Its runner's name. Not set: its node id, `rte-<hostname>-<port>`, which changes with the container |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Its own token, at least 16 characters. Keep it: the runner signs in with it from now on |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Optional: a join token, used only while its runner does not exist yet or waits for approval |

Add these when the network needs them:

| Variable | When |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | The RTE reaches the app through a proxy: `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. A host listed in `NO_PROXY` (comma separated, `.example.com` for a domain) is dialed directly |
| `NODE_EXTRA_CA_CERTS` | The app's certificate comes from a private CA: put the CA's certificate in `/opt/af-rte/data/certificates/ca.pem` and set `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` accepts any certificate of the app, a self-signed one included. Only inside one trusted network: prefer `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (default) gets the playbooks and inventories with each job. Leave it, unless you mount them on the RTE yourself (`local`) |

The other settings an RTE reads are on [Run an RTE](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` and
`RTE_DRAIN_SECONDS` can also be set later on its runner page, which wins over the variable (see
[An RTE's settings](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Start it

A compose file keeps the whole definition in one place, next to the settings. Put the image of step 4 in `image:`:

```bash
sudo tee /opt/af-rte/compose.yml >/dev/null <<'EOF'
services:
  rte:
    image: ghcr.io/ansibleforms/ansibleforms-rte-full:7   # or af-rte-dc2, the image you built
    container_name: af_rte_dc2
    restart: unless-stopped
    # the running playbooks get RTE_DRAIN_SECONDS (25) to finish when the container stops
    stop_grace_period: 40s
    env_file: rte.env
    # the probes, on this host only : nothing connects to an outbound RTE
    ports:
      - "127.0.0.1:8000:8000"
    healthcheck:
      test: ["CMD", "node", "./healthcheck.js"]
      interval: 10s
      timeout: 5s
      retries: 30
      start_period: 30s
    volumes:
      - ./data:/app/dist/persistent
      - ./data/ssh:/home/node/.ssh
      - ./data/git/.gitconfig:/home/node/.gitconfig
      - ./data/ansible/ansible.cfg:/etc/ansible/ansible.cfg
      - ./data/ansible/roles:/etc/ansible/roles
      - ./data/ansible/collections:/etc/ansible/collections
EOF
cd /opt/af-rte && docker compose up -d
```

Docker starts it again after a reboot (`unless-stopped`). Podman has no daemon to do that: enable `podman-restart.service`
(`sudo systemctl enable --now podman-restart`), or run the container as a systemd service with a Quadlet file. On a host with SELinux
enforcing, add `:Z` to each volume (`./data:/app/dist/persistent:Z`).

Without compose, the same container in one command:

```bash
docker run -d --name af_rte_dc2 --restart unless-stopped --stop-timeout 40 \
  --env-file /opt/af-rte/rte.env -p 127.0.0.1:8000:8000 \
  -v /opt/af-rte/data:/app/dist/persistent \
  -v /opt/af-rte/data/ssh:/home/node/.ssh \
  -v /opt/af-rte/data/git/.gitconfig:/home/node/.gitconfig \
  -v /opt/af-rte/data/ansible/ansible.cfg:/etc/ansible/ansible.cfg \
  -v /opt/af-rte/data/ansible/roles:/etc/ansible/roles \
  -v /opt/af-rte/data/ansible/collections:/etc/ansible/collections \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

---

## 7. Check it on the host

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

The log shows the RTE start, dial the app and connect:

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Without a join token, one more line says it waits:
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Note the fingerprint.

`/ready` answers `503` with `not connected to the app` until the socket is open. The healthcheck only tells that the process listens.

---

## 8. Approve it

Without a join token, the RTE asked to join: **Connections > Runners** shows an orange notice above the list,
**1 Runner is waiting for approval**. Open it, check that the **Fingerprint** is the one of the RTE's log and that **Mode** says
Outbound, then **Approve** (see [Approving an RTE](../runners/registration.html#approving-an-rte)). Only an admin approves. A request
nobody handles within 24 hours is removed, and the RTE asks again when it next dials the app.

With a join token, the runner is approved at once and its description names the join token. Either way the app keeps the RTE's token
in a new RTE credential, `rte-dc2-rte`, and the RTE signs in with its own `RTE_TOKEN` from then on: `RTE_JOIN_TOKEN` is no longer
used, and you can remove it from `rte.env`.

---

## 9. Check it in AnsibleForms

1. **Connections > Runners** lists the runner `rte-dc2`, type RTE. Turn on **Columns > Connection** to see **Connected** in the list
2. Open it. Its **RTE** tab shows **Mode** Outbound and the **Connection** badge **Connected**; on hover it names the app node that
   holds the socket, the RTE's release and how many of its jobs run
3. Click **Test connection**: it says **Runner connection is OK**. It calls nothing: it reads which app node holds the RTE's socket
   (`runner_leases`) and checks the contract the RTE spoke when it connected
4. Give it a description, such as *Datacenter 2*
5. Leave **Default** on the runner of datacenter 1, unless every playbook form without a `runner:` should run in datacenter 2

The **Status** page lists the new RTE with its version, next to the others.

---

## 10. A first job

Prove the whole path with a playbook that changes nothing. In the app's playbooks (its playbooks folder or repository, as in
datacenter 1), add `ping-dc2.yaml`:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Then add a form in the designer that names the new runner:

```yaml
name: Ping datacenter 2
type: ansible
playbook: ping-dc2.yaml
runner: rte-dc2
inventory: <an inventory with the hosts of datacenter 2>
roles:
  - admin
categories:
  - Default
fields: []
```

Launch it. The app sends the playbooks folder and the inventory with the job, and the RTE keeps them by their hash, so an unchanged
folder is never sent twice. The output starts with `Running on RTE rte-dc2 (outbound)`, shows `pong` for every host, and the job
ends in success. A folder bigger than [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 by default) is not
sent: the job fails and says so.

---

## 11. Send the forms to it

A form runs on the RTE it names, so add the same line to every form for datacenter 2:

```yaml
runner: rte-dc2
```

See [Runners](../runners.html) for the default runner and the other runner types.

---

## When something fails

The RTE writes to `docker logs` from `notice` up. A connection that fails before the socket opens (a DNS name, a refused port, a
certificate) shows only as `RTE: dialing the app again in <n> seconds`, at `info`: set
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) in `rte.env` and restart it to see
`RTE: socket to wss://...: <the error>`.

| What you see | Where | What to do |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `RTE_TOKEN` is missing or too short in `rte.env` |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Set `APP_URL` in `rte.env` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` starts with `https://` (or `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | `RTE_MODE=outbound` is missing in `rte.env` |
| No `connected to the app` line, `/ready` stays `503` | `docker logs`, `/ready` | The network of step 2: `curl` the app from this host, the proxy (`HTTPS_PROXY`, `NO_PROXY`), the app's certificate (`NODE_EXTRA_CA_CERTS`, step 5). Set `LOG_CONSOLE_LEVEL=debug` to see the error |
| `the app refused the socket (404)` or another status than 401, 403 and 409 | `docker logs` | A reverse proxy does not pass the WebSocket on `/api/v2/rte/socket`, or `APP_URL` lacks the app's base path |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | A runner `rte-dc2` exists with another token. Give the RTE that token (the password of the runner's credential), or delete the runner so that it asks to join |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Make a new join token, or remove `RTE_JOIN_TOKEN` and approve the RTE (step 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | The RTE was installed again with a new token: use the token of its runner's credential, or have an admin change it |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Follows a refusal. Fix its cause, then `docker restart af_rte_dc2` instead of waiting |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Approve it (step 8). It is connected, but takes no job until then |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | The app and the RTE run releases of another [contract](images.html#the-contract): update the RTE to the app's release (see Update it) |
| **Not connected**, or **Test connection** says *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | The app | No app node holds its socket: the RTE is stopped, or cannot reach the app. Read its `docker logs` |
| A job waits, then fails with *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | The job's output | The RTE was not connected while the job waited |
| `Permission denied` on the ssh key | The job's output | The files of `data/` must belong to uid 1000 (step 3) |
| `UNREACHABLE` for the managed hosts | The job's output | ssh from this host: the key, `known_hosts`, and the firewall towards the hosts |

On the app side, a refused RTE shows in the app's log as `Refused an RTE socket from <address>: <why>`.

---

## Update it

When the app moves to a new release, follow it on this host too. An RTE of the same contract keeps working meanwhile; when a release
changes the contract, its release notes say so (see [The contract](images.html#the-contract)). With `:7` in `compose.yml`, or in the
`FROM` of your Dockerfile:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Update it when no playbook runs on it: a stop waits `RTE_DRAIN_SECONDS` (25) for the running playbooks, and the ones still running
then end as abandoned. What they printed before the stop is kept in the spool and sent once the RTE is back. Offline, `docker load`
the new image (step 4) before `docker compose up -d`.

---

## Roll back

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

The socket closes, and the runner shows **Not connected** at once: no app node holds its socket any more (`runner_leases`). A host
that goes away without closing it shows **Not connected** within about a minute, once the app node hears nothing on the socket. The
runner stays: a runner that joined over a socket is never removed by itself. Delete it under **Connections > Runners**, and its
credential `rte-dc2-rte` under **Connections > Credentials**. Remove the `runner:` line from the forms that named it first: until
then their jobs wait for the RTE, up to `RTE_QUEUE_MINUTES`, and fail.

---

## More capacity in datacenter 2

Repeat steps 1 to 9 on more hosts of datacenter 2, each with its own `RTE_NAME` and `RTE_TOKEN`, such as `rte-dc2-b`: each joins as a
runner of its own and takes up to [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks. A form picks one with
`runner:`. Two RTEs with the same `RTE_NAME` do not share the work: the second one takes the socket over from the first (see
[Several RTEs](several.html#several-rtes)).

---

## An RTE in database mode

Before 7.3.0 this runbook set up an RTE in database mode: it held the database's credentials (`DB_*`, `ENCRYPTION_SECRET`), connected
to the database of datacenter 1 over port `3306`, and the app called it on its port `8000`. That mode is deprecated since 7.3.0 and
removed in 8.0.0. To move such an RTE to outbound without a new runner, set `RTE_MODE=outbound`, `APP_URL` and `RTE_NAME` (the name of
its runner) on it, keep its `RTE_TOKEN`, and remove `DB_*`, `ENCRYPTION_SECRET` and `RTE_REGISTER`: see
[Database (deprecated)](modes.html#database-deprecated). Then close port `8000` and the database port it no longer needs.
