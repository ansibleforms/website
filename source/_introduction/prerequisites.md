---
layout: default
title: Prerequisites
nav_order: 4
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
| [From source](installation/from-source.html) | Node.js 24 or newer with npm, Git, and Ansible if you run playbooks locally |

The image is `ghcr.io/ansibleforms/ansibleforms` and includes Ansible, so the container runs playbooks without extra setup.
A source installation needs `ansible-playbook` on the path only for `ansible` forms; AWX forms do not need it.

---

## Database

AnsibleForms stores its jobs, users, credentials and connections in MySQL 8 or later, or in MariaDB.

At the first start it creates the `AnsibleForms` schema itself, so the account in `DB_USER` needs the rights to do so. To create
the schema yourself, set [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) to `0`.
The Docker Compose project and the Helm chart (which uses `mysql:8.4`) start a database for you.

---

## Sizing

There are no measured requirements: the load depends mostly on how many jobs run at the same time and how much output they write.
The Helm chart's default resources are a reasonable starting point for a small team:

| Component | Requests | Limits | Volume |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB memory | 4 CPU, 4 GiB memory | 10 GiB |
| MySQL | 0.5 CPU, 512 MiB memory | 2 CPU, 2 GiB memory | 10 GiB |

Each local job is an `ansible-playbook` process inside the AnsibleForms container, so plan CPU and memory for the
number of playbooks you expect to run at once. Jobs that run on AWX, AAP or Ascender cost AnsibleForms little.

Job output is kept in the database for ever by default. Set [`JOB_RETENTION_DAYS`](customization/paths.html#env_JOB_RETENTION_DAYS)
on a busy instance to keep the database from growing without limit.

---

## Network

AnsibleForms listens on a single port and opens outbound connections to the systems that your forms and settings use.

### Inbound
{: .no_toc }

The server listens on port `8000` ([`PORT`](customization/server.html#env_PORT)), over HTTP or, with
[`HTTPS`](customization/server.html#env_HTTPS) set to `1`, over HTTPS. The Docker Compose project publishes it on port 443,
and the Helm chart exposes it through a service or an ingress.

### Outbound
{: .no_toc }

Open the connections from AnsibleForms to the systems you use:

| Destination | Used for |
|---|---|
| MySQL / MariaDB | The AnsibleForms database (`DB_HOST`, `DB_PORT`, default `3306`) |
| AWX, AAP or Ascender | Launching and following templates, over their HTTP(S) API |
| The managed hosts | Playbooks that run locally connect to them directly, for example over SSH or WinRM |
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

## Single instance

AnsibleForms runs as one instance: two replicas behind a load balancer would run every scheduled job twice and could corrupt job state.

Run one instance that restarts on failure, and back up both the database and the persistent folder. The
[FAQ](faq.html#deployment-topology-single-instance-only) explains the reasons in more detail.
