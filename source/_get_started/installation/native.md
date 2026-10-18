---
layout: default
title: Native
parent: Installation
nav_order: 2
---

# Native install
{: .no_toc }

AnsibleForms directly on the server, without containers, as systemd services the installer sets up
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators of servers where containers are not allowed: the [installer](installer.html) installs everything AnsibleForms needs on
the server itself, then upgrades and removes it. It installs AnsibleForms 7.3.0 or later.

---

## What it needs

Pick **Directly on this server, no containers** at the installer's **Engine** step, or pass `--mode native`. It needs:

* **Root** : run the installer with `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : the services run as systemd units
* **A supported Linux** : Ubuntu, Debian, RHEL and its rebuilds such as Rocky Linux and AlmaLinux, SUSE Linux Enterprise or openSUSE
* **amd64 or arm64**
* **Internet access** : to the distribution's repositories, GitHub, nodejs.org and the Python and Ansible package indexes (see
  [Air-gapped](#air-gapped) for what a release bundle replaces)

On a server that does not meet these, the engine shows as *Directly on this server (needs root: run the installer with sudo)* or
*Directly on this server (not supported on this Linux)*. Both roles install this way: a controller, and a [Runner](installer.html#a-runner).

---

## What it installs

The installer installs these from the distribution's packages, for both roles:

| Package | Why |
|---|---|
| `git` | The repositories |
| The ssh client | The playbooks' connections |
| The MariaDB client | The app's backups |
| `ca-certificates`, `curl`, `tar`, `gzip` | The downloads |
| `libatomic` | Node.js links against it, and minimal servers lack it |
| `sshpass` | Playbooks that sign in with an ssh password. On RHEL and its rebuilds it comes from EPEL, which the installer tries to enable with `epel-release`; when it cannot be installed, the installation goes on and says so |
| The MariaDB server | A controller only: its database |

Then, into the installation folder, with every download checked against its published checksum:

* **AnsibleForms** : the release bundle `ansibleforms-<version>-linux-<arch>.tar.gz` from the app's GitHub release, the app built for
  Node.js. A version without a bundle says *Installing without containers needs AnsibleForms 7.3.0 or later.*
* **Node.js** : the newest release of the major version the bundle names, from nodejs.org
* **Python and Ansible** : uv, then with it the Python of the RTE images and a virtual environment with Ansible and the libraries of
  the full RTE image, then its Ansible collections (see [The RTE images](../rte/images.html)). This takes a few minutes
* **The starting files** : the forms, playbooks and settings of the [docker-compose project](https://github.com/ansibleforms/docker)'s
  `data` folder, as a new Docker Compose install gets them. A Runner keeps only its Ansible configuration, ssh and git settings

For a controller it then makes the `AnsibleForms` schema in MariaDB, and a database user named after the instance with all rights on that
schema and none elsewhere, signing in from this server only.

---

## The folder

Everything lives in the installation folder, `/opt/ansibleforms` (or `/opt/ansibleforms-runner` for a Runner) by default:

| Path | What it holds |
|---|---|
| `releases/<version>/` | A release: the bundle, its link to Node.js, its Python virtual environment and its collections |
| `current` | The link to the release that runs; an upgrade moves it, and so does a rollback |
| `runtime/` | Node.js, uv and Python, shared by the releases |
| `data/` | What the containers mount as `/app/dist/persistent`: forms, playbooks, `config.yaml`, the config seed, certificates and logs |
| `home/` | The system user's home: `.ssh` and `.gitconfig`, linked to `data/ssh` and `data/git` |
| `app.env`, `rte.env` | The services' settings and secrets, readable by root and the system user only. The RTE's holds no database settings |
| `installer-backups/` | The database backups the installer makes, before an upgrade or with `backup` |

The releases and the runtimes belong to root, so the services cannot change their own code; `data/` and `home/` belong to the system user.
The database files themselves are kept by MariaDB, outside the folder.

---

## The services

A controller runs two systemd services, a Runner one. Each runs as a system user named after the instance (`ansibleforms` by default),
from `current/server`, with its settings file:

| Service | What it runs | Settings |
|---|---|---|
| `<name>` | The app: the web interface, the API and the worker. A controller only | `app.env` |
| `<name>-rte` | The RTE that runs the playbooks | `rte.env` |

A controller's RTE is `inbound` on a port of its own on `127.0.0.1` (`8001`, or the next free one), runs the playbooks from the app's
folders (`RTE_FILES=local`), and is declared by the config seed `data/seed.yaml` as the default runner. A Runner's RTE gets the mode,
`APP_URL`, `RTE_NAME` and, with `--join`, the join token, and receives the playbooks with each job (see [Modes](../rte/modes.html)).
Without a join token it asks to join, and an admin approves it under **Connections > Runners**.

They start at boot and restart after a failure. Manage them and read their logs with systemd's own tools:

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

The app may listen on a port under 1024, such as `443`, without root. The RTE keeps the right to use `sudo`, which playbooks with
`become` need on this server.

---

## Upgrade and roll back

`sudo ansibleforms-installer upgrade` upgrades a native install as it does the others (see [Upgrade](installer.html#upgrade)), in
this order:

1. Puts the new release in place next to the one that runs: its bundle, Node.js, Python, Ansible and the collections. The running
   services are not touched yet
2. Adds the new starting files the release brings, keeping every file that exists
3. Backs up the database (a controller) into `installer-backups/`, with a copy of `app.env` and `rte.env`
4. Stops the services, points `current` at the new release, and starts them again
5. Waits for the app to answer with the new version

When the new version does not answer, the installer offers to roll back: `current` points at the previous release again, the
database is restored from the backup, and the services start. Only the running release and the one before it are kept.

---

## Uninstall

`sudo ansibleforms-installer uninstall` stops and removes the services. It keeps the folder and the database, unless you choose to delete
the data (or pass `--purge`), and type the instance's name to confirm. Then it also drops the database and its user (a controller),
deletes the folder and removes the system user.

The packages stay installed, MariaDB among them: other software may use them.

---

## Air-gapped

`--bundle` installs from a release bundle you copied to the server, instead of downloading it from GitHub. Take the file for its
architecture, `ansibleforms-<version>-linux-amd64.tar.gz` or `-arm64`, from the app's [Releases](https://github.com/ansibleforms/ansibleforms/releases):

```bash
sudo ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` does the same for the starting files, from a local copy of the [ansibleforms/docker](https://github.com/ansibleforms/docker)
repository. Node.js, Python with its packages and the Ansible collections are still downloaded during the install.
