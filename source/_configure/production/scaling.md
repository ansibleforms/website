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

### How the RTE runs
{: .no_toc }

The RTE is a container you run yourself, next to the app: AnsibleForms never creates one. This walks through where it runs, what it
shares with the app, and what happens inside it from the moment a form is launched until the playbook's process is gone:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 475" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">How the RTE runs a playbook</title>
<desc id="afr-desc">On a container host or in a Kubernetes pod, both run by the operator, the app container and one or more RTE containers run side by side. 1: the browser launches a form on the app. 2: the app stores the job in the database. 3: the app's runner seals the job's secrets and posts the job to the RTE API. 4: the RTE claims the job in the database. 5: the RTE starts ansible-playbook as a child process, one per job, up to RTE_MAX_JOBS. 6: the playbook reaches the managed hosts. 7: the RTE writes the output and the final status to the database. 8: the app reads them and the browser shows them. The RTE reads the playbooks, inventories, repositories and ssh key from the app's volume, mounted in it.</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="345" rx="14"/>
<text class="afr-h" x="181" y="44">Container host or Kubernetes pod</text>
<text class="afr-s" x="181" y="61">Docker, Podman or Kubernetes: installed and run by you</text>
<rect class="afr-box" x="12" y="96" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="123" text-anchor="middle">Browser</text>
<text class="afr-s" x="71" y="141" text-anchor="middle">forms, job page</text>
<rect class="afr-main" x="190" y="90" width="140" height="125" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">App container</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">web app, API, worker</text>
<rect class="afr-inner" x="202" y="145" width="116" height="56" rx="8"/>
<text class="afr-t" x="260" y="168" text-anchor="middle">Runners</text>
<text class="afr-s" x="260" y="186" text-anchor="middle">seal the secrets</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="240" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="240" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="240" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">RTE container</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="477" y="160" text-anchor="middle">RTE API</text>
<text class="afr-s" x="477" y="174" text-anchor="middle">/rte/v1, with the token</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">up to RTE_MAX_JOBS</text>
<text class="afr-s" x="477" y="322" text-anchor="middle">one process per job</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Managed hosts</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box" x="616" y="272" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="296" text-anchor="middle">App's volume</text>
<text class="afr-s" x="684" y="314" text-anchor="middle">playbooks, .ssh key,</text>
<text class="afr-s" x="684" y="330" text-anchor="middle">inventories, repos</text>
<rect class="afr-box" x="190" y="400" width="370" height="60" rx="10"/>
<text class="afr-t" x="375" y="425" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="375" y="443" text-anchor="middle">jobs, output, heartbeats, runners</text>
<line class="afr-line" x1="130" y1="114" x2="188" y2="114" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="142" x2="132" y2="142" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="330" y1="172" x2="393" y2="172" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="309" x2="614" y2="309" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="215" x2="225" y2="398" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="398" x2="295" y2="217" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="430" y1="330" x2="430" y2="398" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="525" y1="330" x2="525" y2="398" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="114" r="9"/><text class="afr-nt" x="148" y="118" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="377" r="9"/><text class="afr-nt" x="225" y="381" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="172" r="9"/><text class="afr-nt" x="361" y="176" text-anchor="middle">3</text>
<circle class="afr-n" cx="430" cy="377" r="9"/><text class="afr-nt" x="430" y="381" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="525" cy="377" r="9"/><text class="afr-nt" x="525" y="381" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="377" r="9"/><text class="afr-nt" x="295" y="381" text-anchor="middle">8</text>
<circle class="afr-n" cx="148" cy="142" r="9"/><text class="afr-nt" x="148" y="146" text-anchor="middle">8</text>
</svg>
</div>

**Who starts it.** An RTE is a long-running container, started by whatever runs your other containers. It waits for jobs and keeps
running between them:

| How you run AnsibleForms | Who starts the RTE |
|---|---|
| `docker run` or `podman run` | You, with a command like the one in [Run an RTE](#run-an-rte), on any host that reaches the database |
| [Docker Compose](../installation/docker-compose.html) | The `rte` service of `docker-compose.yml`, next to `app` and `mysqldb`. Its config seed declares it as the default runner `rte`, at `http://rte:8000` |
| [Helm chart](../installation/kubernetes.html) | Kubernetes, as a second container named `rte` in the app's pod (`containers.rte`). The app reaches it on `127.0.0.1`, and the chart's seed declares it as the default runner |

The container engine is yours: Docker or Podman on the host, or the container runtime of your Kubernetes cluster, installed and kept up
to date by you. AnsibleForms never talks to it. Neither the app nor the RTE calls Docker or Podman, mounts their socket, or starts a
container: the app only calls the RTE over HTTP, at the address of its runner.

**What is inside.** The RTE image holds the same Node.js server as the app, started with `AF_ROLE=rte` (set in the image) under `tini`.
In that role the server loads no web interface, no login, no scheduler and no worker. It only listens on its `PORT` (`8000` by default)
for a small API under `/rte/v1`, plus `/live` and `/ready` for probes and `/metrics` for Prometheus. Next to it, the image layer brings
python and ansible (see [The RTE images](#the-rte-images)). The server and every playbook run as the user `node` (uid 1000), never as root.

**What it shares with the app.** The RTE reads the job from the database and the playbook from disk, so it needs the same database and
the same files as the app:

| Shared with the app | What the RTE does with it |
|---|---|
| The database (`DB_*`) | Reads the job, claims it, writes its output and final status, writes its heartbeat and its own runner row |
| `RTE_TOKEN` | Checks it on every call. The app holds the same value on the runner row, and the job's secrets are sealed with it |
| `ENCRYPTION_SECRET` | Stores its token encrypted when it registers itself; not needed with `RTE_REGISTER=0` |
| The persistent volume, `/app/dist/persistent` | The playbooks folder ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), or the playbooks repository the worker cloned under [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), the inventories ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) and the inventory repositories) and the uploads. The RTE writes the job's extravars files into the playbook folder, so mount it read-write |
| The ssh folder, `/home/node/.ssh` | The private key and the `known_hosts` the playbook's ssh connections use, the ones managed on the app's settings pages |

The RTE clones nothing: a repository is on its disk only because the volume it shares with the app holds it. Collections, roles and
`ansible.cfg` come from the image, from the folders `/etc/ansible/collections`, `/etc/ansible/roles` and `/etc/ansible/ansible.cfg` when
you mount them there (the Docker Compose project does), or from an `ansible.cfg` next to the playbooks.

**The life of a job.** The numbers below are the numbers in the diagram, for a playbook form launched from the browser or the API:

1. **Launch** : the app checks the form and its values, builds the extravars and stores the job with status `running`. A form with an
   [approval](../forms/approval.html) stops here until an approver accepts it, and reaches no RTE before that
2. **Choose the runner** : the app takes the RTE the form names with `runner: <name>`, else the default runner of type RTE, and stores its
   name on the job. It resolves the job's credentials from the database or a [secret store](../secret-stores/), its ansible login and its
   vault password, and seals them with AES-256-GCM under a key derived from that runner's token and the job id
3. **Hand-over** : the app writes `Running on RTE <name> (<address>)` in the output and calls `POST <address>/rte/v1/jobs` with the token
   as a bearer token, the job id, its contract number and the sealed secrets. The RTE refuses another contract (`409`) and a bundle that
   does not open, and answers `503` while it starts, stops or is full
4. **Claim** : the RTE checks that the job exists, is `running` and is a playbook, then writes its own name on it in the database: only one
   RTE ever claims a job, and a repeated call is harmless. It answers `202` and runs the job in the background
5. **Start** : the RTE reads the extravars from the job row and resolves a named inventory to its folder. In the playbook folder (plus the
   form's `playbookSubPath`, which must exist) it writes two files: `extravars_<id>.json` with the form's values and the credentials, and a
   hidden one with the ansible login. Then it starts `ansible-playbook` as its own child process, without a shell, in a process group of its
   own, with `-e @` those files, one `-i` per inventory, and the tags, limit, check, diff and verbosity of the form. The vault password goes
   in on stdin, never in a file or on the command line, and the process runs as `node` with a filtered environment (see below)
6. **Run** : the playbook connects to the managed hosts from the RTE container, over ssh with the key and the `known_hosts` of
   `/home/node/.ssh`, with `sshpass` for a password login, or over the APIs its modules call. The RTE, not the app, needs to reach them
7. **Output and end** : the RTE stores stdout and stderr in the database in batches, every half second or 64 KB, with the credentials
   masked. Past [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) bytes on a stream (50 MB by default) it stores
   no more, and the playbook goes on. A job log the playbook writes to `.joblogs/job_log_<id>.log` is copied to the job every 2 seconds,
   and what `set_stats` gathers is kept as the job's artifacts. When the process exits, the RTE writes the last line and the final status
   (`success`, `failed` or `aborted`), and the form's [notifications](../forms/notifications.html) go out
8. **Follow** : the app waits on the job row, once a second, until its status is final, and asks the RTE about the job every 30 seconds.
   The browser never talks to the RTE: the form page re-reads the job through the app every 2 seconds, and the Jobs page follows it live

**Abort.** An abort sets the job's abort flag in the database and calls `POST /rte/v1/jobs/<id>/cancel` on its RTE. The RTE sends
`SIGTERM` to the playbook's process group, so `ansible-playbook` and every fork it started stop together, and the job ends `aborted`.
When the cancel call does not get through, the RTE still sees the flag, which it checks every 2 seconds while the playbook runs.

**Clean-up.** As soon as the process exits, whatever the outcome, the RTE removes both extravars files (a form with `keepExtravars`
keeps the visible one, never the hidden one), the artifacts file in `/tmp` and the job log file. It clears the process id and its name
from the job. The end is written once: a second writer, such as the app failing a job the RTE already ended, changes nothing.

**One process per job, not one container per job.** AWX and AAP start a new pod or container from an execution environment image for
every job. AnsibleForms starts nothing: the RTE container is already running, and each job is a child process inside it. A job starts
without pulling an image or scheduling a pod, and AnsibleForms needs no rights on your container engine or cluster. In return, the
playbooks running on one RTE share its CPU, memory, `/tmp`, home folder and python: give the container enough resources for
`RTE_MAX_JOBS` playbooks with their forks. To change what a playbook can use, change the image, not the job.

**Several jobs at once.** One RTE runs up to [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks side by side, 10 by
default (`0` sets no limit). A job for a full RTE is not claimed: the RTE answers `503`, and the app writes
`Waiting for a free slot on RTE <name>` once in the output and asks again every 10 seconds, for
[`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) at most (60 by default). Then the job fails. A job aborted
while it waits ends `aborted` without ever reaching the RTE.

**Several RTEs.** The app does not spread jobs over runners by itself: every job goes to one runner, the one the form names or the
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

**When an RTE stops.** On `SIGTERM` (`docker stop`, a rolling update, a scale down) the RTE stops taking jobs: `/ready` answers `503`,
and new jobs get `503` too, so the app waits or the address sends them to another replica. The running playbooks get
[`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) to finish, 25 by default, then the RTE exits.

**When an RTE dies.** A killed container (out of memory, a lost node, the end of the stop timeout) takes its playbooks with it: nothing
moves them to another RTE, and nothing runs them again. Their jobs are ended as `abandoned`, by the RTE itself when it comes back under
the same name, which a restarted container keeps (`rte-<hostname>-<port>`), or by the worker, once the RTE's heartbeat is two minutes
old. Check on the managed hosts what the playbook did before you launch it again. While the RTE is down, a new job for it fails at
once with *the RTE at ... is unreachable*, unless another replica answers at its address.

**The security boundary.** The RTE runs code that form authors wrote, so it is built to hold as little as possible:

* **A token on every call** : the API answers `401` to any call without the runner's token. It has no users, no login and no web
  pages, and it can only start a playbook job that already exists and is running, report on it, cancel it and report its health. It
  cannot create a job, return output or hand out credentials. Nothing else restricts who calls it, so keep it on a private network
* **Sealed secrets** : to run a job, the RTE never reads the credentials table nor a secret store. It gets the secrets of the jobs it
  runs, sealed for its token and that job id only, so a bundle meant for another RTE or another job does not open, and a changed byte
  is refused. They travel safely over plain HTTP inside your network
* **No inherited environment** : `ansible-playbook` gets the RTE's environment without every variable AnsibleForms reads itself
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, the `MYSQL_*` ones and the others), so
  `lookup('env', ...)` cannot reach them. What you set for playbooks (`PATH`, proxies, `ANSIBLE_*`) passes as it is
* **No templates from users** : {% raw %}a form value that holds `{{`, `{%` or `{#` reaches the playbook as an unsafe string{% endraw %}
  that ansible never templates, unless the form sets `allowJinjaInExtravars`, and no shell ever runs the command line
* **Not root** : the RTE and its playbooks run as `node` (uid 1000), so a playbook can do what that user can in the container, such
  as reading the mounted volume and the ssh key, and no more

The RTE still holds the database password, and `ENCRYPTION_SECRET` when it registers itself: treat its container, its image and its
environment with the same care as the app's.

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
