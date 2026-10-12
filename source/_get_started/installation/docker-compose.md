---
layout: default
title: Docker Compose
parent: Installation
nav_order: 2
---

# Docker Compose
{: .no_toc }

Install AnsibleForms, its RTE and MySQL together with docker-compose or podman-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

The [docker-compose project](https://github.com/ansibleforms/docker) runs three containers: MySQL, the AnsibleForms app, and the RTE
(runtime environment) that runs the playbooks. It holds their settings, sample forms and playbooks, so the only other requirement is
Docker or Podman with its compose tool.

---

## Prerequisites

Before you start, you need:

* **Linux machine** : any distribution, with modest CPU and memory
* **GitHub access** : to download or clone the docker-compose project from GitHub
* **Docker or Podman** : a container engine, installed below
* **A compose tool** : Docker Compose or podman-compose, to start the three containers from a few configuration files

**VIDEO**: [How to install AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Choose a location to install

Create a folder for the project; the examples use `/srv/apps`:

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Clone the docker-compose project

Install Git:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y git
```

</div>
</div>

Then clone the docker-compose project into that folder:

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Set proper permissions

The app and the RTE run as the user `node` (uid 1000), so give that user the `data` folder:

```bash
sudo chown -R 1000:1000 ./data
```

Coming from 6, whose container ran as root, run the same `chown` once before you start 7. MySQL takes its own folder back when it starts.

---

## Install a container engine

Install Docker or Podman, each with its compose tool:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Install Docker Engine with the Compose plugin from Docker's repository
(see the [Docker installation manuals](https://docs.docker.com/engine/install)):

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
# Docker's own dnf repository (Rocky / Alma : use .../linux/centos/docker-ce.repo)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
</div>

Then let names resolve inside the containers, and start Docker as a service:

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman does not require a service. Install it together with podman-compose:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y podman
# podman-compose comes from EPEL (on RHEL, enable EPEL as Red Hat documents it)
sudo dnf install -y epel-release
sudo dnf install -y podman-compose
```

</div>
</div>

</div>
</div>

---

## Customize

Review the variables in the `.env` and `docker-compose.yml` files, and change every password: `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` and `RTE_TOKEN`. [Learn more about the environment variables](../customization)

The app and the RTE connect to MySQL as `ansibleforms` (`MYSQLDB_USER`), with all rights on the `AnsibleForms` schema and none
elsewhere; root is only for MySQL itself. MySQL creates that user on its first start only: an installation that connected as root
so far creates it once, as the project's [README](https://github.com/ansibleforms/docker#database) shows.

The RTE is not published on the host: the app calls it on `http://rte:8000` with `RTE_TOKEN`, and the config seed `data/seed.yaml`
registers it as the default runner `rte`. When your playbooks need more collections or Python libraries, build an RTE of your own
and point the `rte` service at it (see [Build your own RTE](../production/scaling.html#build-your-own-rte)).

---

## Start docker-compose project

Start the three containers in the background. The app waits until MySQL is healthy, and the RTE until the app is:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
# with the older standalone tool : sudo docker-compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose up -d
# podman is service-less : you can run it as any user, with or without sudo
```

</div>
</div>

---

## Test the application

Once the containers are up, open AnsibleForms in a browser:

* Open `https://your_ip` (port 443, see `WEBAPP_LOCAL_PORT` in the .env file)
* Log in as `admin` with the `ADMIN_PASSWORD` of the `.env` file; while it is still the default `AnsibleForms!123`, choose a new password
* Check under **Connections > Runners** that the RTE is listed as `rte`, the default runner
* Next steps:
  * Create forms by adding YAML files to the data/forms/ folder or by using the built-in designer
  * Add your playbooks to the data/playbooks/ folder
  * Add an LDAP connection
  * Add users and groups
  * Add runners for template forms: AWX, AAP or Ascender, Semaphore, Rundeck or Jenkins
  * Add credentials for external connections, such as other MySQL servers or REST APIs, or to pass to Ansible playbooks
  * Connect Git repositories and choose whether your forms and/or playbooks sync with a repository

---

## File structure

The docker-compose project has the following folder structure:

```bash
.
├── docker-compose.yml # the mysqldb, app and rte containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade, mounted in the app and the rte
    ├── ansible # mounted in the rte only
    │   ├── ansible.cfg # ansible settings
    │   ├── roles # roles you install
    │   └── collections # collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions and jq definitions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks, with sample maintenance playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── seed.yaml # the config seed: registers the rte as the default runner
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```
