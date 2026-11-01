---
layout: default
title: From source
parent: Installation
nav_order: 5
---

# From source
{: .no_toc }

Build AnsibleForms from source and run it with Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## How the code is organized

The repository holds two Node.js applications, and a build combines them into one:

* **client** : the web interface, written in Vue 3 and built into static files with Vite
* **server** : the API, written in Express. It hands the jobs to runners, connects to the database and serves the built client.
  Started with `AF_ROLE=rte`, the same server is the RTE (runtime environment) that runs the playbooks

Only the client is built; its output goes into the server's `views` folder, as in the [Docker image](https://github.com/ansibleforms/ansibleforms/blob/main/docker/controller/Dockerfile).

---

## Prerequisites

Building and running from source requires solid Linux skills and some knowledge of Node.js. You install every component yourself. To
run AnsibleForms without containers and without building it, the [native install](native.html) of the installer does all of this for you:

* **Node.js 26** (the version in `.nvmrc`; 24 at least), with npm
* **Git**, to get the code and to sync repositories
* **OpenSSH client**, for git over SSH, and **sshpass**, for playbooks that connect with an SSH password
* **MariaDB client** (`mariadb`, `mariadb-dump`), for backups and restores, also with a MySQL server
* **MySQL 8+ or MariaDB**, reachable from the server
* **Ansible**, for the RTE process that runs the playbooks (`ansible-playbook` on its path). The app process itself needs no
  Ansible and no Python, and with only template forms (AWX, AAP, Ascender and the other runners) you need no RTE at all

Install them for your distribution:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 comes from the NodeSource repository, the other tools from Ubuntu itself:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 comes from the NodeSource repository, the other tools from Debian itself:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js comes from NodeSource and `sshpass` from EPEL (on RHEL itself, enable EPEL as Red Hat documents):

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Check `node --version` (26) and `ansible-playbook --version`; for the database and its user, see [Install MySQL](docker.html#install-mysql).

---

## Get the code

Clone the repository into a folder of your choice, owned by the user that will run the application. The examples use `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Build

Build in three steps, from the repository folder. First build the client:

```bash
cd client
npm ci
npm run build
```

Then install the server's dependencies:

```bash
cd ../server
npm ci --omit=dev
```

Finally copy the built client into the server's `views` folder:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Configure

The server reads its settings from environment variables and, in production, also from `server/persistent/.env`, the file
that the settings pages write to.

Start from the example file at the repository root and set at least the MySQL connection (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

All variables are described under [Environment Variables](../customization). Everything else is stored in `server/persistent` by default:
`config.yaml`, the `forms` folder and self-signed certificates are created there at the first start, alongside the logs.
Put your playbooks in `server/persistent/playbooks`, or point `ANSIBLE_PATH` elsewhere in the environment of the RTE, which reads it.

---

## Run

Run AnsibleForms in production, or in development mode to work on the code itself:

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Production</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Development</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Start the server in production mode from the `server` folder:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

An application started from the command line stops when you log off. [PM2](https://pm2.keymetrics.io/) keeps it running in the
background, restarts it after a crash and starts it again at boot:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Playbooks run on an RTE: start the same server a second time with `AF_ROLE=rte`, on a port of its own. The app dials it and keeps
one WebSocket open (`RTE_MODE=inbound`, see [Modes](../rte/modes.html)), and it runs the playbooks from the same folders
(`RTE_FILES=local`). It reads `persistent/.env` too, but uses none of its database settings. Add the token the app and the RTE share,
at least 16 characters, and the config seed that declares the RTE, to `persistent/.env`:

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

The [config seed](../seed/) declares an RTE credential with the RTE's address and its token, and the default runner `rte` that signs
in with it:

```yaml
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://127.0.0.1:8010
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Without a seed, add them under **Connections > Credentials** (an RTE credential with that address and the token) and
**Connections > Runners** (type RTE, **Mode** **Inbound**). Then start the RTE, on `127.0.0.1` only:

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

The RTE settings are described on the [Run an RTE](../rte/run.html) page. Check that PM2 lists both processes:

```bash
pm2 status
```

Both are `online`:

```text
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| id | name             | mode | version | pid  | uptime | restarts | status | cpu | mem     | user | watching |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| 0  | ansibleforms     | fork | 7.0.0   | 3104 | 8s     | 0        | online | 0%  | 120.1mb | root | disabled |
| 1  | ansibleforms-rte | fork | 7.0.0   | 3187 | 5s     | 0        | online | 0%  | 80.4mb  | root | disabled |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="development" markdown="1" hidden>

To work on the code itself, start everything from the repository root with live reload: the server on port 3001, an RTE on port 8010
and the client on `https://localhost:8443`. In this mode, the server and the RTE read `server/.env.development` instead:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

The RTE (`npm run dev:rte`) needs `ansible-playbook` on the path, and adds itself as a runner in database mode, deprecated, for
development only; `npm run dev:local` starts the client and the server without it. The [contributing guide](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) describes the tests and checks to run.

</div>
</div>

---

## First time run

Open the server in a browser (with the example `.env`, `https://your_ip:8443`). On an empty database, the schema is created at the
first start.

The default admin credentials are:

* username : `admin`
* password : `AnsibleForms!123`
