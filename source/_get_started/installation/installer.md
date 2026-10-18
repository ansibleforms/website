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

The installer asks a few questions in a full-screen wizard, shows every answer for review, and only then changes the server. It installs
one of two roles:

| Role | What it is |
|---|---|
| Controller | The complete application: the web interface, its database and its own Runner. Choose this for a first installation |
| Runner | An RTE that runs the playbooks of an AnsibleForms installed elsewhere, such as in another network, a DMZ or another datacenter. It talks to AnsibleForms over a single WebSocket and holds no database credentials |

And it runs them on one of four engines:

| Engine | How it runs |
|---|---|
| Docker | The [Docker Compose project](docker-compose.html), on Docker Engine with its compose plugin. The containers restart together with Docker |
| Podman | The same project on Podman, rootless or as root, with podman-compose. A systemd unit starts the containers at boot |
| Kubernetes | The [Helm chart](kubernetes.html), on the cluster that `kubectl` reaches, served behind an ingress. A controller only |
| Directly on this server | No containers: Node.js, MariaDB and Ansible on the server, and AnsibleForms as systemd services. See [Native install](native.html) |

After the install, the same program upgrades the installation, backs it up, shows its status and removes it.

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
4. Keeps it as `ansibleforms-installer`, in `/usr/local/bin` for root and `~/.local/bin` otherwise, for the upgrades and backups later on
5. Starts it with the flags given, reading the keyboard from the terminal even though the script came through a pipe

Without a terminal, such as in a CI job, the installer runs unattended (see [Unattended](#unattended)).

---

## The wizard

The wizard asks one question at a time, with the steps listed at the left. **Esc** goes back to the step before, with its answer kept:

| Step | What it asks |
|---|---|
| Language | The installer's language, from this server's locale by default: Catalan, German, English, Spanish, French, Italian, Japanese, Dutch, Polish, Portuguese or Chinese |
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
refuses one older than 7.3.0, and installs the Runner with that same version.

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
| `install` | Install AnsibleForms, as a controller or a Runner (the default). On a server that has an installation already, it offers to upgrade it |
| `upgrade` | Upgrade to a newer version, showing its release notes first (see [Upgrade](#upgrade)) |
| `status` | Show the installation (its role, engine and version) and its containers, pods or services, and whether it answers |
| `backup` | Back up the database now, into `installer-backups` in the installation folder (on Kubernetes, `backups` next to the installer's state file). A Runner holds no data to back up |
| `release-notes` | Show the release notes of a version, `--version` or this installer's, breaking changes first |
| `uninstall` | Remove the installation, and with `--purge` its data |
| `version` | Print the installer's version |

The installer remembers the installation in `/etc/ansibleforms/installer.json` for root, or `~/.config/ansibleforms/installer.json`,
so the commands after `install` need no flags:

```bash
sudo ansibleforms-installer status
sudo ansibleforms-installer backup
sudo ansibleforms-installer upgrade
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

## Upgrade

`ansibleforms-installer upgrade` moves the installation to a newer version of the same major version. It lists the newer versions,
latest first (unattended, it takes the latest), and shows the release notes of every version it moves past, with the breaking changes
and removals first. When they hold breaking changes, it asks you to confirm that you read them; unattended, only `--yes` goes on.

The installer backs up the database before anything changes. When the new version does not respond, it offers to roll back: the previous
version comes back, and its database is restored from that backup. It does not downgrade, and it does not cross a major version: follow
the [upgrade guide](../upgrade-7.html) for that.

A Runner runs the same version as its AnsibleForms: upgrade AnsibleForms first, then its Runners.

---

## Versions

The installer's version follows the app's: each AnsibleForms release comes with an installer of the same version, released with it, and
that installer installs that version by default. `--version` installs another one. Every release on the
[installer's Releases page](https://github.com/ansibleforms/installer/releases) has binaries for Linux on amd64 and arm64, with their
checksums.
