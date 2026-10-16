---
layout: default
title: Installation
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
---

# Installation
{: .no_toc }

Choose an installation method for AnsibleForms
{: .fs-6 .fw-300 }

---

For administrators setting up a new instance: pick an installation method, then follow its page.

---

## In this section

AnsibleForms supports several installation methods, each described on its own page:

| Page | What it covers |
|---|---|
| [Docker](docker.html) | Install MySQL and run the pre-built Docker image with the required environment variables |
| [Docker Compose](docker-compose.html) | Download the [docker-compose project](https://github.com/ansibleforms/docker) and use docker-compose to start both MySQL and AnsibleForms |
| [From source](from-source.html) | Install all dependencies manually, then build and start the code |
| [Kubernetes](kubernetes.html) | Install the Helm chart and use Kubernetes to start AnsibleForms and its MySQL database |

{: .note }
> **Recommendation** The Docker image is the recommended installation method. It includes all dependencies and can be set up quickly.

To move an existing installation to a newer release, see [Upgrading](../upgrading/).

Every method runs one RTE next to the app, the container that runs the playbooks. To add another one, on another host or in another
datacenter, see [Runtime environments](../rte/) and its runbook [An RTE in another datacenter](../rte/another-datacenter.html).

---

## Image tags

The image is published as `ghcr.io/ansibleforms/ansibleforms` on the GitHub Container Registry, which belongs to the
project and does not rate-limit anonymous pulls. Every release from 7.0.0 on is published there only, and the 6.x releases
are there too.

Since 7, playbooks run on an RTE, published in three layers next to the app (see [The RTE images](../rte/images.html)):

| Image | What it is |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | The web application and the API, without python or ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | The RTE without python or ansible: the base for your own |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | The base with python, ansible-core and a few libraries: the one to add your collections to |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | The core with the `ansible` package, its collections and libraries: the default RTE |

The four images are built in the same run and carry the same tags, so an RTE tag always matches the app's.

The old Docker Hub repository, `ansibleguy/ansibleforms`, is no longer updated. It keeps its existing
releases but receives no new versions of either line. If you pull from it, switch
to `ghcr.io/ansibleforms/ansibleforms` with the same tag to keep receiving updates.

The following tags are available on each image; the RTE images start at 7.0.0, so they have no 6.x tags:

| Tag | Points to |
|---|---|
| `latest` | the newest release of the newest major version |
| `7`, `6` | the newest release of that major version |
| `7.0`, `6.5` | the newest release of that minor version |
| `7.0.0`, `6.5.5` | exactly that release |
| `latest-rc` | the newest release candidate, or the newest release when that is newer; each candidate also has its own tag |

`latest` only moves forward: a patch for an older major version (for example a 6.5.x released
after 7.0.0) moves `6` and `6.5`, but never `latest`.

To stay on a major version, use its number (`6`) instead of `latest`.
