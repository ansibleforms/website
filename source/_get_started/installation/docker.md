---
layout: default
title: Docker
parent: Installation
nav_order: 1
---

# Docker
{: .no_toc }

Run the AnsibleForms app and RTE images with Docker or Podman, next to a MySQL server of your own
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

You can run AnsibleForms with Docker or Podman as two containers, the app and the RTE that runs the playbooks, connected to a MySQL database.

---

## Prerequisites

Before you start, you need:

* **Docker or Podman** : one of them installed and running
* **MySQL** : installed and running

---

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

AnsibleForms connects to the database over the network, as `DB_USER` with `DB_PASSWORD`. Give it a user of its own, with rights on
the `AnsibleForms` schema only, not root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

That is all AnsibleForms needs: with it, it creates and patches its schema and makes its backups. The **Status** page and the log
warn when the user has rights on every database. On Ubuntu and Debian the server listens on localhost only: set `bind-address` in its
configuration so that the containers can reach it.

---

## Prepare the folders

AnsibleForms 7 runs in two containers: the app, and the RTE (runtime environment) that runs the playbooks. Both mount a folder for
your `config.yaml`, forms, playbooks, logs and certificates, and a folder for the SSH key. The images run as the user `node` (uid 1000),
so give that user both folders:

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Put the settings both containers share in an environment file. Only the database connection is required; set
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) before you store any credential, the same in both:

```bash
sudo tee /srv/apps/ansibleforms/ansibleforms.env > /dev/null <<'END'
DB_HOST=192.168.0.1
DB_PORT=3306
DB_USER=ansibleforms
DB_PASSWORD=<password>
ENCRYPTION_SECRET=<a long random string>
END
sudo chmod 600 /srv/apps/ansibleforms/ansibleforms.env
```

---

## Start the containers

Run the published images from the GitHub Container Registry (see [Image tags](./#image-tags)):
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) for the app and
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) for the RTE.

The RTE needs a token of at least 16 characters ([`RTE_TOKEN`](../customization/#env_RTE_TOKEN)) and the address the app reaches it on
([`RTE_URL`](../customization/#env_RTE_URL)). It adds itself under **Connections > Runners** as the runner `rte`, the default one, so
playbook forms run on it without further setup. Start it once the app answers, because the app creates the schema at its first start
(a sample `config.yaml` is in the [docker-compose project](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)):

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker network create ansibleforms

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -e RTE_TOKEN='<at least 16 characters>' -e RTE_URL=http://rte:8000 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Once started, both containers are listed:

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman takes the same options and does not require a service:

```bash
podman network create ansibleforms

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -e RTE_TOKEN='<at least 16 characters>' -e RTE_URL=http://rte:8000 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Once started, both containers are listed:

```bash
podman ps
```

</div>
</div>

The app listens on port `8000`, over HTTP unless you set `HTTPS=1`. The RTE is not published on the host: only the app calls it, inside
the network. `--stop-timeout 30` gives the RTE time to let its running playbooks end on a stop (see
[Scaling](../production/scaling.html#run-an-rte) for the RTE settings and for building an RTE of your own).

---

## Test the application

Once the containers are up, open AnsibleForms in a browser:

* Open `http://your_ip:8000` (or HTTPS, if you set `HTTPS=1`)
* Log in as `admin` / `AnsibleForms!123` (or with the password you set with `ADMIN_PASSWORD`), and choose a new password
* Check under **Connections > Runners** that the RTE is listed as `rte`, the default runner
* Next steps:
  * Create forms by adding YAML files to the `forms` folder or by using the built-in designer
  * Add your playbooks to the `playbooks` folder of the mounted persistent folder
  * Add an LDAP connection
  * Add users and groups
  * Add runners for template forms: AWX, AAP or Ascender, Semaphore, Rundeck or Jenkins
  * Add credentials for external connections, such as other MySQL servers or REST APIs, or to pass to Ansible playbooks
