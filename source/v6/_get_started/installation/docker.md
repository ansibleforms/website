---
layout: default
title: Docker
parent: Installation
nav_order: 1
---

# Docker
{: .no_toc }

Run the AnsibleForms image with Docker or Podman, next to a MySQL server of your own
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

You can run AnsibleForms as a standalone container with Docker or Podman, connected to a MySQL database.

## Prerequisites

Before you start, you need:

* **Docker or Podman** : one of them installed and running
* **MySQL** : installed and running

## Install MySQL

Install MySQL 8+, or MariaDB, on a Linux server that the container can reach:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu ships MySQL 8:

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian ships MariaDB in place of MySQL, which AnsibleForms also supports:

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 and later, and its rebuilds, ship MySQL 8 in AppStream:

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms connects to the database over the network, as `DB_USER` with `DB_PASSWORD`. Keep remote root login enabled
when the secure installation script asks, or create a dedicated account. On Ubuntu and Debian the server listens on
localhost only: set `bind-address` in its configuration so that the container can reach it.

## Get the image

Run the published image from the GitHub Container Registry; the tag `6` is the newest AnsibleForms 6 release (see [Image tags](./#image-tags)):

[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms)

Mount a folder or volume at `/app/dist/persistent` for your `config.yaml`, forms, playbooks, logs and certificates.

Only the database connection (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`) is required; the other variables have defaults.

For example (a sample `config.yaml` is in the [docker-compose project](https://github.com/ansibleforms/docker/blob/v6/data/config.yaml)):

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker run -p 8000:8000 -d -t --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:6
```

Once started, the container is listed:

```bash
docker ps
CONTAINER ID   IMAGE                                  COMMAND                  CREATED         STATUS         PORTS                                       NAMES
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:6    "node ./index.js"        7 seconds ago   Up 6 seconds   0.0.0.0:8000->8000/tcp, :::8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman takes the same options and does not require a service:

```bash
podman run -p 8000:8000 -d -t --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:6
```

Once started, the container is listed:

```bash
podman ps
```

</div>
</div>

## Test the application

Once the container is up, open AnsibleForms in a browser:

* Open `http://your_ip:8000` (or HTTPS, if you set `HTTPS=1`)
* Log in as `admin` / `AnsibleForms!123` (or with the password you set with `ADMIN_PASSWORD`)
* Next steps:
  * Create forms by adding YAML files to the `forms` folder or by using the built-in designer
  * Add your playbooks to the `playbooks` folder of the mounted persistent folder
  * Add an LDAP connection
  * Add users and groups
  * Add an AWX connection
  * Add credentials for external connections, such as other MySQL servers or REST APIs, or to pass to Ansible playbooks
