---
layout: default
title: RTE
nav_order: 11
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
`rte`, a runtime environment: the AnsibleForms server started with `AF_ROLE=rte`, next to python and ansible, without a web
interface. It talks to the app over one WebSocket and holds no database credentials
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` or `inbound`, see [Modes](modes.html)): the app sends it the job,
the RTE runs `ansible-playbook`, and the app stores the output and the final status it sends back, where the browser reads them.

The app resolves the job's credentials and hands them to the RTE sealed for that RTE and that job only. The RTE never reads the
credentials table nor a secret store, and a playbook does not inherit AnsibleForms' own environment variables
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` and the others): pass such a value as an extravar or a credential. The RTE of 7.0 to 7.2,
which read and wrote the database itself, still runs in 7.x as the deprecated database mode (see [Database mode](#database-mode-deprecated)).

---

## How the RTE runs

The RTE is a container you run yourself, next to the app or in another network: AnsibleForms never creates one. This walks through
where it runs, what it shares with the app, and what happens inside it from the moment a form is launched until the playbook's process
is gone:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">How the RTE runs a playbook</title>
<desc id="afr-desc">On a container host or in a Kubernetes cluster, both run by the operator, the app container and one or more RTE containers each hold one WebSocket between them, opened by the app (inbound) or by the RTE (outbound). Only the app talks to the database. 1: the browser launches a form on the app. 2: the app stores the job in the database, chooses the runner and seals the job's secrets for it. 3: the app sends the job over the socket. 4: the RTE claims it and gets the job's files, from its cache or from the app. 5: the RTE starts ansible-playbook as a child process, one per job, up to RTE_MAX_JOBS. 6: the playbook reaches the managed hosts. 7: the RTE writes the output, the events and the end to its spool and sends them over the socket; the app stores them in the database and acknowledges them. 8: the browser follows the job through the app. The app's volume is mounted in the RTE only with RTE_FILES=local.</desc>
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
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">Container host or Kubernetes cluster</text>
<text class="afr-s" x="181" y="61">run by you; an outbound RTE may sit in another network</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Browser</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">forms, job page</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">App container</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">web app, API, worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runners</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">seal the secrets</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">RTE hub</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">stores, then acks</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">RTE container</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="469" y="160" text-anchor="middle">Job files</text>
<text class="afr-s" x="469" y="174" text-anchor="middle">cached by hash</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">up to RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">kept until acked</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">one</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Managed hosts</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">App's volume</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbooks, inventories</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">RTE_FILES=local only</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">the app's only</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="532" cy="161" r="9"/><text class="afr-nt" x="532" y="165" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

The diagram shows one socket per RTE whichever side opened it: the app dials an inbound RTE, an outbound RTE dials the app (see
[Modes](modes.html)). The same messages go both ways once it is open, and only the app reads and writes the database.

**Who starts it.** An RTE is a long-running container, started by whatever runs your other containers. It waits for jobs and keeps
running between them:

| How you run AnsibleForms | Who starts the RTE |
|---|---|
| `docker run` or `podman run` | You, with a command like the one in [Run an RTE](run.html), on any host that reaches the app, or that the app reaches |
| [Docker Compose](../installation/docker-compose.html) | The `rte` service of `docker-compose.yml`, next to `app` and `mysqldb`. Its config seed declares it as the default runner `rte`, inbound, at `http://rte:8000` |
| [Helm chart](../installation/kubernetes.html) | Kubernetes, as a second container named `rte` in the app's pod (`containers.rte`). The app dials it on `127.0.0.1`, inbound, and the chart's seed declares it as the default runner |
| [The installer](../installation/installer.html) | Docker Compose or the Helm chart as above, or a systemd service [without containers](../installation/native.html); a Runner of its own, which asks to join and waits for an admin's approval |

The container engine is yours: Docker or Podman on the host, or the container runtime of your Kubernetes cluster, installed and kept up
to date by you. AnsibleForms never talks to it. Neither the app nor the RTE calls Docker or Podman, mounts their socket, or starts a
container: the app only talks to the RTE over its socket.

**What is inside.** One container, with what it takes to run a playbook and nothing more:

* **The server** : the same Node.js server as the app, started with `AF_ROLE=rte` (set in the image) under `tini`
* **Left out** : the web interface, the login, the scheduler, the worker and every database module, which this role does not load
* **What it listens on** : its `PORT` (`8000`): `/live` and `/ready` for probes and `/metrics` for Prometheus, and inbound the socket
  the app dials, `/rte/v1/socket`. An outbound RTE takes no connection from the app
* **Python and ansible** : brought by the image layer you pick (see [The RTE images](images.html))
* **The user** : the server and every playbook run as `node` (uid 1000), never as root

**What it shares with the app.** Its token, and with `RTE_FILES=local` the app's files. With `RTE_FILES=transfer`, the default, the
playbooks and inventories come with each job, and the RTE needs no shared disk:

| Shared with the app | What the RTE does with it |
|---|---|
| `RTE_TOKEN` | Presents it when it dials the app (outbound), or checks it when the app dials it (inbound). The app holds the same value in the runner's RTE credential, and the job's secrets are sealed with it |
| The persistent volume, `/app/dist/persistent`, with `RTE_FILES=local` only | The playbooks folder ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), or the playbooks repository the worker cloned under [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), the inventories ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) and the inventory repositories) and the uploads. The RTE writes the job's extravars files into the playbook folder, so mount it read-write |
| The ssh folder, `/home/node/.ssh` | The private key and the `known_hosts` the playbook's ssh connections use: mount the app's, managed on its settings pages, or give the RTE its own |

The RTE clones nothing: a repository reaches it in a job's files, or on the volume it shares with the app. Collections, roles and
`ansible.cfg` come from the image, from the folders `/etc/ansible/collections`, `/etc/ansible/roles` and `/etc/ansible/ansible.cfg` when
you mount them there (the Docker Compose project does), or from an `ansible.cfg` next to the playbooks.

**The life of a job.** The numbers below are the numbers in the diagram, for a playbook form launched from the browser or the API:

1. **Launch** : the app checks the form and its values, builds the extravars and stores the job with status `running`. A form with an
   [approval](../forms/approval.html) stops here until an approver accepts it, and reaches no RTE before that
2. **Choose the runner** : the app takes the RTE the form names with `runner: <name>`, else the default runner of type RTE, and stores its
   name on the job. It resolves the job's credentials from the database or a [secret store](../secret-stores/), its ansible login and its
   vault password, and seals them with AES-256-GCM under a key derived from that runner's token and the job id
3. **Hand-over** : the app node that holds the RTE's socket sends it the job: the extravars, the form's options, the sealed secrets and
   the hashes of the job's files. Any app node may launch the job; the one holding the socket sends it within two seconds. A full RTE,
   or one not connected, makes the job wait, up to [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Claim** : the RTE answers `claimed`, or `refused` when it is full, stopping, cannot open the secrets, or the job comes with another
   [contract](images.html#the-contract) than its own. With `RTE_FILES=transfer` it takes the playbooks and the inventories from its
   cache by their hash, asks the app for a hash it does not have, and unpacks them in a folder of the job's own
5. **Start** : in the playbook folder (plus the form's `playbookSubPath`, which must exist) it writes two files: `extravars_<id>.json`
   with the form's values and the credentials, and a hidden one with the ansible login. Then it starts `ansible-playbook` as its own child
   process, without a shell, in a process group of its own, with `-e @` those files, one `-i` per inventory, and the tags, limit, check,
   diff and verbosity of the form. The vault password goes in on stdin, never in a file or on the command line, and the process runs as
   `node` with a filtered environment (see below)
6. **Run** : the playbook connects to the managed hosts from the RTE container, over ssh with the key and the `known_hosts` of
   `/home/node/.ssh`, with `sshpass` for a password login, or over the APIs its modules call. The RTE, not the app, needs to reach them
7. **Output and end** : the RTE batches stdout and stderr every half second or 64 KB, with the credentials masked, and numbers each
   batch. It writes every item to the job's spool on its disk before it sends it: the output, the events, the job log of
   `.joblogs/job_log_<id>.log` (every 2 seconds), the start and the end with the final status (`success`, `failed` or `aborted`). The app
   stores each item once and acknowledges it, and the RTE drops the spool once the end is stored. Past
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) bytes on a stream (50 MB by default) it sends no more, and
   the playbook goes on. The app then sends the form's [notifications](../forms/notifications.html)
8. **Follow** : the browser never talks to the RTE: the form page re-reads the job through the app every 2 seconds, and the Jobs page
   follows it live as the app stores each item

**A dropped socket.** The playbook goes on. The RTE redials (outbound), or an app node dials it again (inbound), and sends again what
the app had not acknowledged: the app skips what it stored already, so no line is lost or stored twice. That holds while the socket
is back within two minutes: the app writes the RTE's heartbeat only while its socket is open, and once that heartbeat is two minutes
old the worker ends the RTE's running jobs as abandoned, even if their playbooks still run. Keep the spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) on a volume, so a restarted RTE still sends what it had kept. A
playbook that was running when its RTE restarted cannot go on: the app ends its job as abandoned when the RTE comes back without it.

**Abort.** An abort sets the job's abort flag, and the app node that holds the RTE's socket sends `cancel` within two seconds. The RTE
sends `SIGTERM` to the playbook's process group, so `ansible-playbook` and every fork it started stop together, and the job ends
`aborted`. A cancel that arrives before its job is kept for a minute, and the job then starts aborted.

**Clean-up.** As soon as the process exits, whatever the outcome, the RTE removes both extravars files (a form with `keepExtravars`
keeps the visible one, never the hidden one), the artifacts file in `/tmp`, the job log file and the job's own folder of files. The
end is stored once: a second writer, such as the app failing a job the RTE already ended, changes nothing.

**One process per job, not one container per job.** AWX and AAP start a new pod or container from an execution environment image for
every job. AnsibleForms starts nothing: the RTE container is already running, and each job is a child process inside it. A job starts
without pulling an image or scheduling a pod, and AnsibleForms needs no rights on your container engine or cluster. In return, the
playbooks running on one RTE share its CPU, memory, `/tmp`, home folder and python: give the container enough resources for
`RTE_MAX_JOBS` playbooks with their forks. To change what a playbook can use, change the image, not the job.

---

## The security boundary

The RTE runs code that form authors wrote, so it is built to hold as little as possible:

* **Its token only** : the RTE holds no database credentials and no `ENCRYPTION_SECRET`. It takes no call but the app's socket, with
  its token, and has no users, no login and no web pages. Over the socket it can only run the jobs the app sends it, report on them and
  ask for their files: it cannot create a job, read another job or hand out credentials
* **Sealed secrets** : to run a job, the RTE never reads the credentials table nor a secret store. It gets the secrets of the jobs it
  runs, sealed for its token and that job id only, so a bundle meant for another RTE or another job does not open, and a changed byte
  is refused
* **A checked connection** : outbound, the RTE checks the app's certificate. Inbound over HTTPS, the app pins the RTE's own certificate
  when it joins, and dials it only when it presents that one (see [Modes](modes.html#inbound)). An inbound RTE over plain HTTP belongs
  on a private network, such as the Docker Compose project's
* **No inherited environment** : `ansible-playbook` gets the RTE's environment without every variable AnsibleForms reads itself
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, the `MYSQL_*` ones and the others), so
  `lookup('env', ...)` cannot reach them. What you set for playbooks (`PATH`, proxies, `ANSIBLE_*`) passes as it is
* **No templates from users** : {% raw %}a form value that holds `{{`, `{%` or `{#` reaches the playbook as an unsafe string{% endraw %}
  that ansible never templates, unless the form sets `allowJinjaInExtravars`, and no shell ever runs the command line
* **Not root** : the RTE and its playbooks run as `node` (uid 1000), so a playbook can do what that user can in the container, such
  as reading its files and the ssh key, and no more

Treat its container, its image and its environment with the same care as the app's.

---

## Database mode (deprecated)

The RTE of 7.0 to 7.2, without `RTE_MODE`, runs all through 7.x and is removed in 8.0.0. It differs from the steps above in four ways:

* **It holds the database** : its `DB_*` settings, and `ENCRYPTION_SECRET` when it registers itself
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **The hand-over is an HTTP call** : the app calls `POST <address>/rte/v1/jobs` with the token and the sealed secrets, and the RTE claims
  the job by writing its name on it in the database (steps 3 and 4)
* **It writes the output itself** : in the database, in batches, with no spool (step 7). An abort reaches it through the job's abort flag,
  which it reads every 2 seconds, and a `/cancel` call
* **It reads the files from the app's volume** : it needs the same disk as the app, as with `RTE_FILES=local`

Its runner page has none of the [RTE settings](../runners/runner-page.html#an-rtes-settings): it reads its own variables. To move it to a
socket mode, see [Modes](modes.html#database-deprecated).
