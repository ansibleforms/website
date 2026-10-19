---
layout: default
title: Installer
parent: Installation
nav_order: 1
---

# The installer
{: .no_toc }

Install, upgrade and look after AnsibleForms on a Linux server, in one command
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: the quickest way to a working instance, or to a Runner for an AnsibleForms installed elsewhere. Since 7.3.0.

---

## What it installs

The installer asks a few questions in a full-screen wizard, shows every answer for review, and only then changes the server.
It installs one of two roles, on one of four engines:

| Role | What it is |
|---|---|
| Controller | The complete application: the web interface, its database and its own Runner. Choose this for a first installation |
| Runner | An RTE that runs the playbooks of an AnsibleForms installed elsewhere, such as in another network, a DMZ or another datacenter. It talks to AnsibleForms over a single WebSocket and holds no database credentials |

The engines it installs them on:

| Engine | How it runs |
|---|---|
| Docker | The [Docker Compose project](docker-compose.html), on Docker Engine with its compose plugin. The containers restart together with Docker |
| Podman | The same project on Podman, rootless or as root, with podman-compose. A systemd unit starts the containers at boot |
| Kubernetes | The [Helm chart](kubernetes.html), on the cluster that `kubectl` reaches, served behind an ingress. A controller only |
| Directly on this server | No containers: Node.js, MariaDB and Ansible on the server, and AnsibleForms as systemd services. See [Native install](native.html) |

After the install, the same program upgrades the installation, backs it up, shows its status and removes it. It also takes over an
AnsibleForms it did not install, such as one set up by hand from the Docker Compose project (see [An existing installation](#an-existing-installation)).

---

## Run it

The install script downloads the installer for this server and starts it:

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

The usual variants: as root, to install Docker or Podman, to install directly on the server or under `/opt`; with a command or
flags (see [Flags](#flags)); and an installer of a given release instead of the latest:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

The script:

1. Checks that the server runs Linux on amd64 or arm64, and finds `curl` or `wget` and `sha256sum`
2. Downloads `ansibleforms-installer_linux_<arch>` from the latest release of
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases), or of the release `AF_INSTALLER_VERSION` names
3. Checks it against the release's `checksums.txt`, and uses no download whose checksum differs
4. Keeps it as `ansibleforms-installer`, in `/usr/local/bin` for root and `~/.local/bin` otherwise, for the upgrades and backups later on.
   Through sudo, run it by its full path: sudo's `secure_path`, as on Red Hat systems, often leaves out `/usr/local/bin`
5. Starts it with the flags given, reading the keyboard from the terminal even though the script came through a pipe

Without a terminal, such as in a CI job, the installer runs unattended (see [Unattended](#unattended)).

---

## The wizard

The wizard asks one question at a time, with the steps listed at the left. **Esc** goes back to the step before, with its answer kept:

| Step | What it asks |
|---|---|
| Language | The installer's language, from this server's locale by default: Catalan, German, English, Spanish, French, Italian, Japanese, Dutch, Polish, Portuguese or Chinese. Asked first, before the installer says anything about an installation it found |
| Release notes | What's new in the version it installs, with the breaking changes, removals and deprecations first |
| Role | Controller or Runner |
| Engine | Docker, Podman, Kubernetes, or directly on this server |
| Folder | The installation folder, and the instance name |
| Join, App, Mode | A Runner only: see [A Runner](#a-runner) |
| Network | The port of the web interface, or of the Runner |
| HTTPS | How browsers connect to a controller |
| Admin | The password of the first admin, typed twice |
| Cluster, Ingress, Storage | Kubernetes only: the namespace and release, the ingress, the storage class |
| Review | Every answer: **Install**, or **Change answers** |

**Engine.** The list shows what this server has. An engine it lacks is offered as *Docker (not installed: the installer installs it)*
or the same for Podman: once you confirm, the installer installs Docker with Docker's own script (`get.docker.com`, compose plugin
included) or Podman with podman-compose from the distribution's packages. That needs root. Kubernetes is offered when `kubectl` and
`helm` are installed and reach a cluster. *Directly on this server* needs root and a supported Linux, and says why when it is greyed out.

**Folder.** The defaults:

| | Controller | Runner |
|---|---|---|
| Folder, as root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Folder, as another user | `~/ansibleforms` | `~/ansibleforms-runner` |
| Instance name, Docker or Podman | `af` | `runner` |
| Instance name, native | `ansibleforms` | `ansibleforms-runner` |

With Docker or Podman, the folder holds the compose file and its `.env` with the secrets, and all the data: database, forms, playbooks
and logs. It must be empty. The instance name, lowercase letters, digits and `-`, prefixes the containers (`af_app`, `af_db`, `af_rte`), so several
instances can share a server. A Runner's instance name is also its runner's name under **Connections > Runners** (`RTE_NAME`).

**Network.** A controller's web interface listens on `443`, or the next free port. **HTTPS** then offers:

| Choice | What it does |
|---|---|
| HTTPS with a self-signed certificate created for this server | A certificate for this server's names, valid for ten years. Browsers ask you to accept it once |
| HTTPS with my own certificate and key | Your own certificate and key, in PEM format, from your CA or from Let's Encrypt |
| HTTP, with HTTPS handled by a reverse proxy in front | Plain HTTP on the port, for nginx, Traefik or a load balancer that handles HTTPS |

**Admin.** The password of the `admin` user, typed twice so that a typo does not lock you out. Left empty, the installer generates a
strong one.

**The end.** The installer generates the database password and the secrets, starts AnsibleForms and waits until it answers. It then
shows the address to open, the user and the password, and the folder. Runners installed for it ask to join, and an admin approves
them under **Connections > Runners** (see [A Runner](#a-runner)).

---

## A Runner

A Runner is an RTE for an AnsibleForms that runs elsewhere, on version 7.3.0 or later. It holds no database credentials: it signs in
with a token of its own, which AnsibleForms keeps in an RTE credential (see [Modes](../rte/modes.html)). After the folder, the wizard
asks three more things:

| Step | What it asks |
|---|---|
| App | The address of the AnsibleForms this Runner works for, the one people open in a browser |
| Mode | **Outbound: the Runner connects to AnsibleForms** (the default), or **Inbound: AnsibleForms connects to the Runner** |
| Network | The Runner's port, `8000` by default. Outbound, only the health checks listen on it, reachable from this server only. Inbound, also this server's address as AnsibleForms reaches it |

`--role runner` skips the role question, so this command, run on the Runner's server, starts with the questions of a Runner:

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

The installer then connects to AnsibleForms. A self-signed certificate, or one from a private CA, asks **Trust this certificate?**:
yes sets [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) on the Runner. It reads the version AnsibleForms runs,
refuses one older than 7.3.0, and installs the Runner with that same version, whatever version the installer itself would install.

Choose outbound for a DMZ, NAT, or a zone that allows no incoming connections: only traffic from this server to AnsibleForms, on its
port. Choose inbound for networks where the central side opens every connection.

The review shows **Registers: asks for approval**, or **itself, with a join token** when `--join` gave one. At the end the installer
shows the Runner's name, its mode, the app and, inbound, its address, then says that it asked to join AnsibleForms: approve it under
**Connections > Runners**, after checking that the fingerprint shown there is the one it prints:

```
Fingerprint: abcd-ef12
```

The fingerprint is the first 8 hexadecimal digits of the SHA-256 of the Runner's token, `RTE_TOKEN`, which is kept in the folder's
`.env` file (`rte.env` for a [native install](native.html)). See [Approving an RTE](../runners/registration.html#approving-an-rte). With `--join`, the Runner is approved at once:
it registered itself, and shows as connected under **Connections > Runners**.

An inbound Runner serves its socket over HTTPS. The installer creates a self-signed certificate for the address AnsibleForms
reaches it on, valid for ten years, in the folder's `data/certificates`, and sets `RTE_URL` to `https://<address>:<port>`.
The Runner sends the certificate when it asks to join, and AnsibleForms pins it: it dials that Runner only when it presents
that same certificate, so no CA is needed. The installer prints the certificate's fingerprint below the token's:

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

It is the first 8 hexadecimal digits of the SHA-256 of the certificate's DER bytes, as `xxxx-xxxx`. Before you approve the Runner,
check that the approval dialog shows the same certificate fingerprint. A Runner registered with `--join` prints it too.

For a Runner, Kubernetes is greyed out: *Kubernetes (a Runner there is installed with the Helm chart)*.

---

## Kubernetes

For a controller on Kubernetes, the installer installs the [Helm chart](kubernetes.html) on the cluster `kubectl` reaches:

| Question | Default |
|---|---|
| Namespace | `ansibleforms` |
| Helm release name | `ansibleforms` |
| Hostname served by the ingress | None: required, such as `ansibleforms.example.com` |
| Ingress class | One of the cluster's, `nginx` by default |
| Serve it over HTTPS (using the ingress certificate)? | Yes |
| Storage class for the volumes | The cluster default |

The admin password is in the Secret `<release>-secrets` of that namespace, under the key `ADMIN_PASSWORD`. The installer keeps the
chart values in a file next to its state file, `<release>-values.yaml`, and applies it again on upgrades; `--values` adds a file of your own. The chart of a release is published shortly after it.

---

## Commands

The installer takes a command, before or after its flags. Without one, it installs:

| Command | What it does |
|---|---|
| `install` | Install AnsibleForms, as a controller or a Runner (the default). On a server that has an installation already, its own or one it finds, it offers to upgrade it |
| `upgrade` | Upgrade to a newer version, showing its release notes first (see [Upgrade](#upgrade)) |
| `status` | Show the installation (its role, engine and version) and its containers, pods or services, and whether it answers. Then it lists any other AnsibleForms it finds on the server |
| `backup` | Back up the database now, into `installer-backups` in the installation folder (on Kubernetes, `backups` next to the installer's state file). A Runner holds no data to back up |
| `release-notes` | Show the release notes of a version, `--version` or this installer's, breaking changes first |
| `uninstall` | Remove the installation, and with `--purge` its data |
| `version` | Print the installer's version |

The installer remembers the installation in `/etc/ansibleforms/installer.json` for root, or `~/.config/ansibleforms/installer.json`
for another user, so the commands after `install` need no flags and find the installation on their own. That folder holds no binary,
and only exists once the installer has installed an AnsibleForms or taken one over:

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` asks **Also delete its data (database, forms, playbooks, logs)?**. To delete it, type the instance's name (the Helm release
on Kubernetes); otherwise it removes the containers, pods or services and keeps the data.

---

## Flags

Each flag answers a question, which the wizard then skips. `ansibleforms-installer --help` lists them:

| Flag | What it answers |
|---|---|
| `--lang <code>` | The language: `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` or `zh` |
| `--version <version>` | The AnsibleForms version to install or upgrade to; this installer's by default |
| `--role <role>` | `controller` or `runner` |
| `--mode <mode>` | `compose`, `kubernetes` or `native` |
| `--runtime <runtime>` | `docker` or `podman` (compose) |
| `--install-runtime` | Install Docker or Podman when missing, without asking |
| `--dir <folder>` | The installation folder (compose) |
| `--name <name>` | The instance name, its containers' prefix (compose, `af` by default) |
| `--port <port>` | The port on the host: the web interface for a controller, the RTE for a Runner |
| `--tls <choice>` | `self`, `own` or `off` (a compose controller) |
| `--cert <file>`, `--key <file>` | The certificate and key files, with `--tls own` |
| `--admin-password <password>` | The first admin's password; generated by default |
| `--join <token>` | A join token (`afj_...`), made through the API, which approves the Runner at once (a Runner, unattended; see [Join tokens](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | The app's address, such as `https://forms.example.com` (a Runner) |
| `--runner-mode <mode>` | `outbound` (the RTE dials the app) or `inbound` (the app dials the RTE) (a Runner) |
| `--host <address>` | This server's address, which the app dials (an inbound Runner) |
| `--namespace <namespace>` | The Kubernetes namespace, `ansibleforms` by default |
| `--release <release>` | The Helm release, `ansibleforms` by default |
| `--hostname <name>` | The ingress hostname (kubernetes) |
| `--ingress-class <class>` | The ingress class (kubernetes) |
| `--storage-class <class>` | The storage class (kubernetes) |
| `--values <file>` | An extra Helm values file (kubernetes) |
| `--purge` | With `uninstall`: also delete the data |
| `--source <folder>` | A local copy of the [ansibleforms/docker](https://github.com/ansibleforms/docker) repository to install from (air-gapped) |
| `--bundle <file>` | A release bundle, `ansibleforms-<version>-linux-<arch>.tar.gz`, to install natively from (see [Native install](native.html#air-gapped)) |
| `--yes` | Answer every question with its default (unattended) |
| `--verbose` | Show every command it runs |

---

## Unattended

With `--yes`, or without a terminal, the installer asks nothing: the flags answer their questions and the defaults answer the rest. It
skips the language, the release notes, the admin password (generated, unless `--admin-password` gives one) and the review, and prints
the link to the release notes instead. It installs a missing Docker or Podman only with `--install-runtime` or `--yes`, and a Runner
needs `--app-url`. Without `--join`, the Runner asks to join and waits for an admin's approval; with it, it is approved at once.

A controller on Docker, installing Docker when it is missing:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

An inbound Runner on Podman, which the app dials at `rte-dmz.example.com:8000`:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## An existing installation

The installer remembers what it installed in `installer.json`. Without that file, `install`, `upgrade` and `status` first look for an
AnsibleForms already on the server, whatever installed it:

| Found | How it is found | Taken over when |
|---|---|---|
| Docker or Podman | Containers of the app or RTE image, grouped by compose project | The folder holds the compose file and `.env` of the [ansibleforms/docker](https://github.com/ansibleforms/docker) repository: the services `mysqldb`, `app` and `rte`, in the containers `<name>_db`, `<name>_app` and `<name>_rte` |
| A 7.2 Runner | An RTE alone in its compose project, with the app's `DB_*` and no `RTE_MODE` (database mode) | Its compose file is readable. Its upgrade moves it to a socket mode (see [A 7.2 Runner](#a-72-runner)) |
| Kubernetes | Helm releases of the `ansibleforms` chart, and Deployments and StatefulSets of its images | It is a release of the chart: its current values become its values file |
| Native | systemd services that run AnsibleForms with Node.js | They follow the installer's layout: `releases/`, `current`, `app.env` and `rte.env` (see [Native install](native.html#the-folder)) |
| No engine | The app or an RTE answering on a usual port: 443, 3000, 3001, 8000, 8001, 8010 or 8443 | Never: it runs from source or by hand. The installer only reports it |

Only the app's and the RTE's images count: a MySQL container named after AnsibleForms is not an installation. The installer lists what
it found, one line each, with the reason and what to do by hand for one it cannot take over: its compose file is not the repository's,
its database is outside its compose project, it runs on Kubernetes without the Helm chart, or its version cannot be read.

For an installation it can take over, `install` offers three choices:

| Choice | What it does |
|---|---|
| Take over and upgrade | Shows what it will remember, then writes `installer.json` once you confirm, and continues with the [upgrade](#upgrade) |
| Install a new AnsibleForms beside it anyway | A second installation, with its own folder, ports and database, after a confirmation of its own |
| Stop | Nothing is changed |

`upgrade` offers the same without the second choice, and stops when nothing can be taken over. Unattended, `install` stops with a message,
and `upgrade --yes` takes an installation over only when it finds exactly one it can take over. A Kubernetes release's current values are
saved next to `installer.json`, and the upgrades apply them again with the chart of the new version.

---

## Upgrade

`ansibleforms-installer upgrade` moves the installation to a newer version of the same major version. It lists the newer versions,
latest first (unattended, it takes the latest), and shows the release notes of every version it moves past, with the breaking changes
and removals first. When they hold breaking changes, it asks you to confirm that you read them; unattended, only `--yes` goes on.

The installer backs up the database before anything changes. When the new version does not respond, it offers to roll back: the previous
version comes back, and its database is restored from that backup. It does not downgrade, and it does not cross a major version: follow
the [upgrade guide](../upgrade-7.html) for that, for example from 6.x to 7.x, with what to do on 6.5 before you upgrade.

On Docker or Podman, a controller's upgrade also brings its files up to date with the new version of the docker repository:

| File | What the upgrade does |
|---|---|
| `docker-compose.yml` | Replaced by the new version's, after a copy is saved in `installer-backups` |
| `.env` | Every existing line is kept, and the keys the new version needs are added, with secrets made as a fresh install makes them. A copy is saved first |
| `data/seed.yaml` | Replaced when it is a seed the docker repository shipped, unchanged. One changed by hand is kept, and the new one is saved beside it |
| `data/` | The new files the version brings, such as a new playbook, are added. Every file that exists is kept |

A missing database setting (`MYSQLDB_USER` or a password) cannot be made up for a database that exists, so the upgrade then stops before
any change. A rollback puts the compose file, `.env` and seed back as they were.

A Runner runs the same version as its AnsibleForms: upgrade AnsibleForms first, then its Runners. A Runner's upgrade rewrites its
compose file for the new RTE image and keeps its `.env` and data as they are.

---

## A 7.2 Runner

A Runner of 7.2 runs in database mode, deprecated since 7.3.0: its RTE holds the database settings of AnsibleForms. The installer finds
it (see [An existing installation](#an-existing-installation)), and its upgrade moves it to a socket mode under the same runner:

1. It reads the runner's name (`RTE_NAME`) and token (`RTE_TOKEN`) from the old RTE container. When the RTE did not register itself
   (`RTE_REGISTER=0`), you type the name its runner has under **Connections > Runners**
2. It asks the app's address and the mode, **outbound** by default or inbound, and for inbound the port and this server's address
3. It shows the plan, then backs up the old compose file and `.env` to `installer-backups`
4. It writes the installer's Runner layout without the `DB_*` settings. It keeps `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` and `METRICS_TOKEN`, which a socket-mode RTE still reads
5. It starts the new RTE beside the old one. The new RTE signs in with the runner's own token, and AnsibleForms moves the runner to the
   new mode itself, **without an approval**: its jobs and the forms that name it are unchanged
6. Once the new RTE is connected, the old container is stopped and removed

An inbound Runner serves HTTPS with a pinned certificate, as a new one does (see [A Runner](#a-runner)), and the installer prints its
certificate fingerprint. When the old RTE holds the port the new one needs, it is stopped first, so the Runner is offline until the
new one connects. An outbound Runner's new RTE takes a free port on `127.0.0.1` and runs beside the old one without a gap.

When the installer cannot read a token from the old RTE, you choose how the new RTE signs in:

| Choice | What follows |
|---|---|
| Type the runner's token | The password of the runner's RTE credential under **Connections > Credentials**. The runner keeps its name and jobs |
| Join as a new runner with a join token | A [join token](../runners/registration.html#join-tokens) adds a new runner under another name. Retire the old runner by hand |

When the new RTE does not connect, the installer offers to put the old files back and start the old container again; if AnsibleForms
had already moved the runner, set its mode back to database under **Connections > Runners**. Once the new RTE is connected, there is
no going back: the old files stay in `installer-backups`.

When AnsibleForms knows no runner by that name, the new RTE asks to join instead and waits for an approval. Reject that request under
**Connections > Runners**, then run the upgrade again with the name the runner has there.

---

## Versions

The installer's version follows the app's: each AnsibleForms release comes with an installer of the same version, released with it, and
that installer installs that version by default. `--version` installs another one. Every release on the
[installer's Releases page](https://github.com/ansibleforms/installer/releases) has binaries for Linux on amd64 and arm64, with their
checksums.
