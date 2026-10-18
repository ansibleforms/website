---
layout: default
title: Another datacenter
parent: RTE
nav_order: 5
---

# An RTE in another datacenter
{: .no_toc }

From a bare host in a second datacenter to an RTE running its first playbook
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

For administrators: when the managed hosts of a second datacenter should be reached from an RTE in that datacenter, not from the first one.

{: .note }
> **Since 7.3.0** This runbook sets up an RTE in database mode, deprecated since 7.3.0: it connects to the database of datacenter 1. An
> outbound RTE needs no such link, only HTTPS from datacenter 2 to the app, and no database credentials: see [Modes](modes.html) and
> [Run an RTE](run.html#start-it). The [installer](../installation/installer.html#a-runner) sets one up on the host from a join token.

---

## What you end with

The app, its worker and its database stay where they are, in datacenter 1. Datacenter 2 gets a host that runs one RTE container: it
connects to the database of datacenter 1, adds itself as a runner, and runs the playbooks of the forms that name it, against the managed
hosts of datacenter 2.

| Where | What runs there | Talks to |
|---|---|---|
| Datacenter 1 | The app nodes, the worker, the database (as today) | The RTE of datacenter 2, on its port `8000`, to hand it jobs |
| Datacenter 2, the RTE host | Docker or Podman, and the RTE container | The database of datacenter 1 (`3306`), and the managed hosts of datacenter 2 |

Every command below runs in a terminal on the RTE host, as a user with `sudo`, unless it says otherwise. It takes about 30 minutes,
most of it waiting for the image.

---

## 0. Before you start

Collect these, most of them from the `.env` of the app in datacenter 1:

| What | Where it comes from |
|---|---|
| `DB_HOST`, `DB_PORT` | The database of datacenter 1, as **datacenter 2** reaches it (an address over your link between the datacenters) |
| `DB_USER`, `DB_PASSWORD` | The app's own database user (step 4 checks that it may connect from this host) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | The app's own value: the RTE stores its token encrypted when it registers itself |
| The app's release | **Status** page, or the app's image tag: the RTE runs the same one, such as `7.2.0` |
| The RTE's name | The DNS name the app will call it on, such as `rte-dc2.example.com` |
| The playbooks | The git repository (or folder) the app's playbooks come from |
| The ssh key | The private key the playbooks use to reach the managed hosts, or the right to create one |

The RTE writes the job output straight into the database, and the database connection has no TLS setting of its own: run it over your
private link or VPN between the datacenters, never over the open internet. Every output line is a write, so a slow link slows the output
down, not the playbook.

---

## 1. Prepare the host

The RTE is a container, so the host needs a container engine and nothing else: Node.js, python and ansible are in the image.

| Need | Why |
|---|---|
| Linux on **x86_64** (amd64) | The RTE images are published for amd64 only |
| 2 CPU and 4 GB of memory, or more | One RTE runs up to [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks at once (10), each with its forks: size it for them |
| 20 GB of free disk | The `-rte-full` image is about 3.3 GB, plus an image during updates, the playbooks and the jobs' temporary files |
| Docker, or Podman with podman-compose | To pull and run the image |
| The time set by NTP | The jobs' times and the heartbeats are compared with the other nodes' |
| Outbound HTTPS to `ghcr.io` | To pull the official image, unless it comes from your own registry (step 7) |

**Docker**, on Ubuntu or Debian (other distributions: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl git chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, on RHEL, Rocky or Alma Linux:

```bash
sudo dnf install -y podman podman-compose git chrony nmap-ncat
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

With Podman, write `podman` for `docker` and `podman-compose` for `docker compose` in every command below.

---

## 2. Name and certificate

The app calls the RTE over HTTPS, at a name it can resolve and a certificate it trusts.

1. **DNS** : add an `A` record for `rte-dc2.example.com` pointing to this host's address, resolvable from the app nodes and the worker of
   datacenter 1. Check from there: `getent hosts rte-dc2.example.com`
2. **Certificate** : a key and a certificate for that name. With your own CA, make the key and the request here and send the request to
   your CA:

   ```bash
   sudo mkdir -p /opt/af-rte/data/certificates && cd /opt/af-rte/data/certificates
   sudo openssl req -new -newkey rsa:2048 -nodes -keyout key.pem -out rte-dc2.csr \
     -subj "/CN=rte-dc2.example.com" -addext "subjectAltName=DNS:rte-dc2.example.com"
   # send rte-dc2.csr to your CA, and save what it returns here as cert.pem (with the intermediate CAs after it)
   ```

   For a test only, a self-signed certificate does: the runner then needs **Ignore certificates**, or this certificate as its CA (step 11):

   ```bash
   sudo openssl req -x509 -newkey rsa:2048 -nodes -days 365 -keyout key.pem -out cert.pem \
     -subj "/CN=rte-dc2.example.com" -addext "subjectAltName=DNS:rte-dc2.example.com"
   ```

The RTE reads `key.pem` and `cert.pem` from that folder by default ([`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY),
[`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)).

---

## 3. Network and firewall

| From | To | Port | Why |
|---|---|---|---|
| The RTE host | The database of datacenter 1 | `3306` | The RTE claims its jobs and writes their output and status |
| The app nodes and the worker | The RTE host | `8000` | They hand jobs to the RTE and cancel them |
| The RTE host | The managed hosts of datacenter 2 | ssh (`22`), WinRM, their APIs | The playbooks run from here |
| The RTE host | `ghcr.io` | `443` | To pull the image (not with your own registry) |

Open `8000/tcp` for the app nodes and the worker only: the RTE answers any caller that has its token, and no browser ever calls it.

```bash
# firewalld (RHEL family)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="<app network>/24" port port="8000" protocol="tcp" accept'
sudo firewall-cmd --reload
# ufw (Ubuntu)
sudo ufw allow from <app network>/24 to any port 8000 proto tcp
```

Then check the database port from here:

```bash
nc -zv <DB_HOST> <DB_PORT>
```

---

## 4. Database access

A MySQL user is allowed from some addresses only. Check that the app's user may connect from this host, with a throwaway client:

```bash
docker run --rm -it mysql:8.4 mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p -e "SELECT COUNT(*) FROM AnsibleForms.jobs"
```

A count means it works. *Access denied* or *Host is not allowed* means the user exists for other hosts only: on the database, as an
administrator, give it this host too, with the same rights on the AnsibleForms schema the app's user has:

```sql
CREATE USER '<DB_USER>'@'<RTE host address>' IDENTIFIED BY '<DB_PASSWORD>';
GRANT ALL PRIVILEGES ON AnsibleForms.* TO '<DB_USER>'@'<RTE host address>';
```

---

## 5. Folders

Everything lives under `/opt/af-rte`. The RTE runs as the user `node` (uid 1000), so its data belongs to that uid:

```bash
sudo mkdir -p /opt/af-rte/data/{playbooks,ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Folder | In the container | Holds |
|---|---|---|
| `data/` | `/app/dist/persistent` | The playbooks, the certificates, the python libraries a playbook installs |
| `data/ssh/` | `/home/node/.ssh` | The ssh key and `known_hosts` of the playbooks |
| `data/ansible/` | `/etc/ansible/...` | An `ansible.cfg`, roles and collections of your own, mounted instead of built in |

---

## 6. Playbooks and ssh key

The RTE runs the playbooks from its own disk and clones nothing, so they must be here, in the same layout as in datacenter 1.

**Playbooks.** Clone the repository the app's playbooks come from, at the place the app expects them
([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `/app/dist/persistent/playbooks` by default):

```bash
sudo git clone https://git.example.com/automation/playbooks.git /opt/af-rte/data/playbooks
```

Keep it current like datacenter 1 does: a `git pull` from cron, or the same NFS share mounted at `/opt/af-rte/data/playbooks`. A form's
`playbookSubPath` must exist here too.

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

## 7. The image

Pick one of the two.

### Option A: the official image
{: .no_toc }

The published images are on the GitHub Container Registry, public, no login needed (see [Images](images.html) for the three layers).
Take the same layer as datacenter 1, and pin the app's release so both run the same code:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7.2.0
```

`:7` follows the latest 7 release instead, and `:7.2` its patches; a pinned tag changes only when you change it.

A host without internet access gets the image from one that has it:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7.2.0
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7.2.0 | gzip > rte-full-7.2.0.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.2.0.tar.gz
```

Or push it once to your own registry (`docker tag` and `docker push`), and use that name in the next steps.

### Option B: your own image
{: .no_toc }

When the playbooks of datacenter 2 need collections or python libraries the official image lacks (the VMware ones for this datacenter's
vCenter, for example), build on `ansibleforms-rte-core`, at the app's release:

```bash
sudo mkdir -p /opt/af-rte/build
sudo tee /opt/af-rte/build/Dockerfile >/dev/null <<'EOF'
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7.2.0
# the collections and python libraries these playbooks use : no root needed, both belong to node
RUN ansible-galaxy collection install community.vmware -p /usr/share/ansible/collections \
 && pip install --no-cache-dir pyvmomi
EOF
docker build -t af-rte-dc2:7.2.0 /opt/af-rte/build
```

Rebuild it on each new release of the app, with the new tag in `FROM` (see [Build your own RTE](images.html#build-your-own-rte)).
With several RTE hosts, build once and push to your own registry.

---

## 8. Settings

A new [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), at least 16 characters:

```bash
openssl rand -base64 24
```

```bash
sudo tee /opt/af-rte/rte.env >/dev/null <<'EOF'
DB_HOST=<db host as datacenter 2 reaches it>
DB_PORT=3306
DB_USER=<the app's database user>
DB_PASSWORD=<its password>
ENCRYPTION_SECRET=<the app's ENCRYPTION_SECRET>
RTE_TOKEN=<the new token>
RTE_URL=https://rte-dc2.example.com:8000
PORT=8000
HTTPS=1
PYTHONPATH=/app/dist/persistent/python/lib
EOF
sudo chmod 600 /opt/af-rte/rte.env
```

[`RTE_URL`](../customization/server.html#env_RTE_URL) is the address the app calls, and its host becomes the runner's name,
`rte-dc2.example.com`. The other settings an RTE reads are on [Run an RTE](run.html#settings).

---

## 9. Start it

A compose file keeps the whole definition in one place, next to the settings. Put the image of step 7 in `image:`:

```bash
sudo tee /opt/af-rte/compose.yml >/dev/null <<'EOF'
services:
  rte:
    image: ghcr.io/ansibleforms/ansibleforms-rte-full:7.2.0   # or af-rte-dc2:7.2.0, the image you built
    container_name: af_rte_dc2
    restart: unless-stopped
    # the running playbooks get RTE_DRAIN_SECONDS (25) to finish when the container stops
    stop_grace_period: 40s
    env_file: rte.env
    ports:
      - "8000:8000"
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
  --env-file /opt/af-rte/rte.env -p 8000:8000 \
  -v /opt/af-rte/data:/app/dist/persistent \
  -v /opt/af-rte/data/ssh:/home/node/.ssh \
  -v /opt/af-rte/data/git/.gitconfig:/home/node/.gitconfig \
  -v /opt/af-rte/data/ansible/ansible.cfg:/etc/ansible/ansible.cfg \
  -v /opt/af-rte/data/ansible/roles:/etc/ansible/roles \
  -v /opt/af-rte/data/ansible/collections:/etc/ansible/collections \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7.2.0
```

---

## 10. Check it on the host

The RTE connects to the database, then adds itself as a runner within 30 seconds:

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy)
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -sk https://localhost:8000/ready
curl -sk -H "Authorization: Bearer <RTE_TOKEN>" https://localhost:8000/rte/v1/health
```

`/ready` answers `200` once the RTE takes jobs, and `/rte/v1/health` returns its version, its contract, its Ansible version and the jobs it
runs. Then, **on an app node in datacenter 1**, check that the app reaches it with its certificate:

```bash
curl -s https://rte-dc2.example.com:8000/ready
```

---

## 11. Check it in AnsibleForms

1. **Connections > Runners** lists a new runner of type RTE named `rte-dc2.example.com`, registered *automatic*
2. Open it and click **Test connection**: it shows the RTE's release and Ansible version
3. Give it a description, such as *Datacenter 2*. With a certificate from a private CA, add that CA on the runner rather than ignoring
   certificates
4. Leave **Default** on the runner of datacenter 1, unless every playbook form without a `runner:` should run in datacenter 2

The **Status** page lists the new RTE with its version, next to the others.

---

## 12. A first job

Prove the whole path with a playbook that changes nothing. In the playbooks repository (so datacenter 1 has it too), add `ping-dc2.yaml`:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Pull it on the RTE host (`git -C /opt/af-rte/data/playbooks pull`), then add a form in the designer that names the new runner:

```yaml
name: Ping datacenter 2
type: ansible
playbook: ping-dc2.yaml
runner: rte-dc2.example.com
inventory: <an inventory with the hosts of datacenter 2>
roles:
  - admin
categories:
  - Default
fields: []
```

Launch it. The output starts with `Running on RTE rte-dc2.example.com`, shows `pong` for every host, and the job ends in success.

---

## 13. Send the forms to it

A form runs on the RTE it names, so add the same line to every form for datacenter 2:

```yaml
runner: rte-dc2.example.com
```

See [Runners](../runners.html) for the default runner and the other runner types.

---

## When something fails

| What you see | Where | What to do |
|---|---|---|
| `RTE : set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `RTE_TOKEN` is missing or too short in `rte.env` |
| `You must set the database environment variables` | `docker logs` | A `DB_*` value is missing in `rte.env` |
| `ECONNREFUSED` or a timeout to the database | `docker logs` | The firewall or the address of step 3: `nc -zv <DB_HOST> <DB_PORT>` |
| *Access denied* from the database | `docker logs` | The user may not connect from this host: step 4 |
| No runner appears under **Connections > Runners** | The app | `docker logs` says why; `RTE_REGISTER=0` turns registration off, and `ENCRYPTION_SECRET` must be the app's |
| **Test connection** fails, or *the RTE at ... is unreachable* on a job | The app | The app does not reach `RTE_URL`: the DNS name, port `8000` in the firewall, and the certificate (step 2) |
| The runner shows the RTE in red, with an update to make | **Test connection**, **Status** | The RTE speaks another contract than the app: run the app's release (step 7) |
| `Permission denied` on the playbooks or the ssh key | The job's output | The files must belong to uid 1000 (step 6) |
| The playbook folder or `playbookSubPath` is not found | The job's output | The playbooks are not at the same place as in datacenter 1 (step 6) |
| `UNREACHABLE` for the managed hosts | The job's output | ssh from this host: the key, `known_hosts`, and the firewall towards the hosts |

---

## Update it

When the app moves to a new release, follow it on this host too. An RTE of the same contract keeps working meanwhile, so there is no hurry
within a release (see [Build your own RTE](images.html#build-your-own-rte)). Put the new tag in `compose.yml`, or in the `FROM` of your
Dockerfile, then:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build -t af-rte-dc2:<new tag> build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

---

## Roll back

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

The runner turns *unresponsive* two minutes later and the worker removes it after ten, or delete it under **Connections > Runners** at once.
Remove the `runner:` line from the forms that named it, or they fail with *the RTE at ... is unreachable*.

---

## More capacity in datacenter 2

Repeat steps 1 to 10 on more hosts of datacenter 2, with the **same** `RTE_URL` and `RTE_TOKEN`, and put a load balancer on that address
in front of them. They share the one runner `rte-dc2.example.com`, and each takes up to
[`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks (see [Several RTEs](several.html#several-rtes)).
