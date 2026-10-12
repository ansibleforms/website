---
layout: default
title: Prerequisites
nav_order: 5
---

# Prerequisites
{: .no_toc }

What you need before you install AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Runtime

AnsibleForms runs as a container or, for those who build it themselves, as a Node.js application:

| Installation | You need |
|---|---|
| [Docker](installation/docker.html) | Docker or Podman, and a MySQL server of your own |
| [Docker Compose](installation/docker-compose.html) | Docker Compose or podman-compose; the project starts MySQL too |
| [Kubernetes](installation/kubernetes.html) | A cluster, Helm 3 and a StorageClass (or pre-created PersistentVolumes) |
| [From source](installation/from-source.html) | Node.js 26 (24 at least) with npm, Git, and Ansible for the RTE process that runs the playbooks |

The app image, `ghcr.io/ansibleforms/ansibleforms`, holds Node.js and the tools the server calls (git, ssh, the mariadb client and
ytt), but no Python and no Ansible. Playbooks run on an RTE (runtime environment), a second container from
`ghcr.io/ansibleforms/ansibleforms-rte-full`, or from an image you build on `ansibleforms-rte-core` (see [Scaling](production/scaling.html#the-rte)).
Forms that only launch templates on AWX, AAP, Ascender, Semaphore, Rundeck or Jenkins need no RTE.

---

## Database

AnsibleForms stores its jobs, users, credentials and connections in MySQL 8 or later, or in MariaDB.

At the first start it creates the `AnsibleForms` schema itself. Give it a database user of its own, with rights on that schema only,
not root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

That is all it needs: it creates and patches the schema, makes its backups and, with several workers, ends the session of a dead one.
The **Status** page and the log warn when the user has rights on every database. The app nodes, the workers and the RTEs all
connect with this user. To create the schema yourself, set [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) to `0`.
The Docker Compose project and the Helm chart (which uses `mysql:8.4`) start a database for you.

---

## Sizing

There are no measured requirements: the load depends mostly on how many jobs run at the same time and how much output they write.
The Helm chart's default resources are a reasonable starting point for a small team:

| Component | Requests | Limits | Volume |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB memory | 4 CPU, 4 GiB memory | 10 GiB |
| MySQL | 0.5 CPU, 512 MiB memory | 2 CPU, 2 GiB memory | 10 GiB |

The app container runs no playbook. Each playbook is an `ansible-playbook` process, with its forks, on an RTE: size every RTE's CPU and
memory for the playbooks it runs at once, at most [`RTE_MAX_JOBS`](customization/#env_RTE_MAX_JOBS) (`10` by default), and run more
RTEs to run more. Jobs that run on AWX, AAP, Ascender or the other template runners cost AnsibleForms little.

Job output is kept in the database for ever by default. Set [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
on a busy instance to keep the database from growing without limit.

---

## Network

The app and each RTE listen on a port of their own, and open outbound connections to the systems that your forms and settings use.

### Inbound
{: .no_toc }

The server listens on port `8000` ([`PORT`](customization/server.html#env_PORT)), over HTTP or, with
[`HTTPS`](customization/server.html#env_HTTPS) set to `1`, over HTTPS. The Docker Compose project publishes it on port 443,
and the Helm chart exposes it through a service or an ingress. An RTE listens on its own `PORT` too, but only the app calls it:
keep it off the public network.

### Outbound
{: .no_toc }

Open the connections from AnsibleForms to the systems you use:

| Destination | Used for |
|---|---|
| MySQL / MariaDB | The AnsibleForms database (`DB_HOST`, `DB_PORT`, default `3306`) |
| The RTE | Handing playbook jobs to it, at its [`RTE_URL`](customization/#env_RTE_URL); the RTE itself connects to MySQL |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Launching and following templates and jobs on [runners](runners.html), over their HTTP(S) API |
| The managed hosts | Playbooks connect to them from the RTE, for example over SSH or WinRM |
| LDAP, Entra ID, OIDC | Logging in with directory or single sign-on accounts |
| Git servers | Cloning and pulling repositories, over HTTPS or SSH |
| REST APIs and databases | The data sources of expressions and queries in your forms |
| HashiCorp Vault, CyberArk | Reading credentials from a [secret store](secret-stores/) |
| Mail server | Notifications and approval mails |
| Model provider | The [chat assistant](chat/), only when it is switched on |

To limit which hosts the REST functions of expressions may call, see
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) and
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Browser

The web application is built for current browsers: Chrome or Edge 111, Firefox 114, Safari 16.4 or newer.
Older browsers are not supported.

---

## Scaling

By default one AnsibleForms container runs the web app and the background work together, next to one RTE.

To serve more users, run several app nodes behind a load balancer (`AF_ROLE=app`) next to a worker (`AF_ROLE=worker`), which runs the
schedules, the backups and the other background work; only one worker works at a time, and a second one waits to take over. They share
the database, the persistent folder, `ACCESS_TOKEN_SECRET` and `ENCRYPTION_SECRET`. Run more RTEs to run more playbooks at once. See
[Scaling](production/scaling.html).
