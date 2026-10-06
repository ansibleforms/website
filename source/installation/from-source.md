---
layout: default
title: From source
parent: Installation
nav_order: 3
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

* **client** : the web interface, in Vue 3, built with Vite into static files
* **server** : the API, in Express. It runs the playbooks and AWX templates, talks to the database and serves the built client

The server needs no compiling: it runs its JavaScript directly. Only the client is built, and its output is copied into the
server's `views` folder, which is what the [docker image](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile) does too.

---

## Prerequisites

Building and running from source needs good Linux skills and some knowledge of Node.js. You install everything yourself:

* **Node.js 24 or newer**, with npm
* **Git**, to get the code
* **MySQL 8 or MariaDB**, reachable from the server
* **Ansible**, if you run playbooks locally (`ansible-playbook` on the path). Not needed if you only launch AWX or AAP templates

---

## Get the code

Clone the repository in a folder of your choice, owned by the user that will run the application. The examples use `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Build

Build the client first, then install the server's dependencies and copy the built client into the server's `views` folder:

```bash
cd client
npm ci
npm run build

cd ../server
npm ci --omit=dev
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Configure

The server reads its settings from environment variables, and in production also from `server/persistent/.env`, the file the
settings pages write. Start from the example file and set at least the MySQL connection (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp .env.example persistent/.env
```

All variables are described under [Environment Variables](../customization). Everything else lives in `server/persistent` by default:
`config.yaml`, the `forms` folder and self-signed certificates are created there at the first start, next to the logs.
Put your playbooks in `server/persistent/playbooks`, or point `ANSIBLE_PATH` elsewhere.

---

## Run

Start the server in production mode from the `server` folder:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

### Run with PM2

Running from the command line stops the application when you log off. [PM2](https://pm2.keymetrics.io/) keeps it running in the
background, restarts it after a crash and starts it again at boot:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Once started:

```bash
pm2 status
┌────┬──────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name         │ mode    │ version │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼──────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ ansibleforms │ fork    │ 7.2.0   │ 3104     │ 8s     │ 0    │ online    │ 0%       │ 120.1mb  │ root     │ disabled │
└────┴──────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### Run in development

To work on the code itself, the repository root starts both halves with live reload: the server on port 3001 and the client on
`https://localhost:8443`. The server then reads `server/.env.development` instead:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp .env.example .env.development)
(cd client && npm install)
npm run dev
```

The [contributing guide](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) covers the tests and checks to run.

---

## First time run

Surf to the server (with the example `.env`, `https://your_ip:8443`). Against an empty database the schema is created at the
first start. The default admin user is:

* username : admin
* password : AnsibleForms!123
