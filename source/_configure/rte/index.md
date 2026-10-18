---
layout: default
title: RTE
nav_order: 10
has_children: true
has_toc: false
permalink: /rte/
---

# Runtime environments (RTE)
{: .no_toc }

What an RTE is, how it runs a playbook, and what it may touch
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: understand the RTE before you run one, size it, or move it to another network.

| Page | What it covers |
|---|---|
| [Images](images.html) | The three RTE images, and building your own with the collections your playbooks use |
| [Modes](modes.html) | Outbound, inbound or database: who opens the connection, the spool, the job's files |
| [Run an RTE](run.html) | The settings of each mode, and a `docker run` example of each |
| [Several RTEs](several.html) | Capacity, replicas behind one address, and what happens when an RTE stops or dies |
| [Another datacenter](another-datacenter.html) | A runbook: add an RTE in a second datacenter, from a bare host to its first job |

---

## What an RTE is

AnsibleForms 7 runs no playbook in the app container. The job of an `ansible` form is handed to a [runner](../runners.html) of type
`rte`, a runtime environment: the AnsibleForms server started with `AF_ROLE=rte`, next to python and ansible. It is a small API
without a web interface. Since 7.3.0 it talks to the app over one WebSocket and holds no database credentials
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` or `inbound`, see [Modes](modes.html)): the app sends it the job,
the RTE runs `ansible-playbook`, and the app stores the output and the final status it sends back, where the browser reads them. In
database mode, deprecated, the RTE claims the job in the database and writes the output there itself. The app resolves the job's credentials and hands them to the RTE sealed for that RTE and that job only. The RTE never reads the
credentials table nor a secret store, and a playbook does not inherit AnsibleForms' own environment variables
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` and the others): pass such a value as an extravar or a credential.

---

## How the RTE runs

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

The diagram and the steps below show an RTE in database mode, deprecated since 7.3.0. In a socket mode the path is the same, with three
differences: the app sends the job over the socket instead of the RTE claiming it in the database (steps 3 and 4), the RTE sends its
output and status back over the socket and the app stores them (step 7), and the playbooks come with the job unless `RTE_FILES=local`.

**Who starts it.** An RTE is a long-running container, started by whatever runs your other containers. It waits for jobs and keeps
running between them:

| How you run AnsibleForms | Who starts the RTE |
|---|---|
| `docker run` or `podman run` | You, with a command like the one in [Run an RTE](run.html), on any host that reaches the database |
| [Docker Compose](../installation/docker-compose.html) | The `rte` service of `docker-compose.yml`, next to `app` and `mysqldb`. Its config seed declares it as the default runner `rte`, inbound, at `http://rte:8000` |
| [Helm chart](../installation/kubernetes.html) | Kubernetes, as a second container named `rte` in the app's pod (`containers.rte`). The app dials it on `127.0.0.1`, inbound, and the chart's seed declares it as the default runner |
| [The installer](../installation/installer.html) | Docker Compose or the Helm chart as above, or a systemd service [without containers](../installation/native.html); a Runner of its own with a join token |

The container engine is yours: Docker or Podman on the host, or the container runtime of your Kubernetes cluster, installed and kept up
to date by you. AnsibleForms never talks to it. Neither the app nor the RTE calls Docker or Podman, mounts their socket, or starts a
container: the app only talks to the RTE over its socket, or calls it over HTTP in database mode.

**What is inside.** One container, with what it takes to run a playbook and nothing more:

* **The server** : the same Node.js server as the app, started with `AF_ROLE=rte` (set in the image) under `tini`
* **Left out** : the web interface, the login, the scheduler and the worker, which this role does not load
* **What it listens on** : its `PORT` (`8000`): the API under `/rte/v1`, `/live` and `/ready` for probes, `/metrics` for Prometheus
* **Python and ansible** : brought by the image layer you pick (see [The RTE images](images.html))
* **The user** : the server and every playbook run as `node` (uid 1000), never as root

**What it shares with the app.** In database mode the RTE reads the job from the database and the playbook from disk, so it needs the
same database and the same files as the app. In a socket mode it shares only the token, and the files when `RTE_FILES=local`:

| Shared with the app | What the RTE does with it |
|---|---|
| The database (`DB_*`), database mode only | Reads the job, claims it, writes its output and final status, writes its heartbeat and its own runner row |
| `RTE_TOKEN` | Checks it on every call. The app holds the same value in the runner's RTE credential, and the job's secrets are sealed with it |
| `ENCRYPTION_SECRET`, database mode only | Stores its token encrypted when it registers itself; not needed with `RTE_REGISTER=0` |
| The persistent volume, `/app/dist/persistent`, not needed with `RTE_FILES=transfer` | The playbooks folder ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), or the playbooks repository the worker cloned under [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), the inventories ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) and the inventory repositories) and the uploads. The RTE writes the job's extravars files into the playbook folder, so mount it read-write |
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

---

## The security boundary

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

In a socket mode the RTE holds no database credentials and no `ENCRYPTION_SECRET`, only its own token. In database mode it still holds the
database password, and `ENCRYPTION_SECRET` when it registers itself. Either way, treat its container, its image and its environment with
the same care as the app's.
