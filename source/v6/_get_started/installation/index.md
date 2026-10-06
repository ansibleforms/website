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

AnsibleForms supports several installation methods, each described on its own page:

* **[Docker](docker.html)** : install MySQL and run the pre-built Docker image with the required environment variables
* **[Docker Compose](docker-compose.html)** : [download the docker-compose project](https://github.com/ansibleforms/docker/tree/v6) and use docker-compose to start both MySQL and AnsibleForms
* **[From source](from-source.html)** : install all dependencies manually, then build and start the code
* **[Kubernetes](kubernetes.html)** : install the Helm chart and use Kubernetes to start AnsibleForms and its MySQL database

{: .note }
> **Recommendation** The Docker image is the recommended installation method. It includes all dependencies and can be set up quickly. These pages are for AnsibleForms 6, which uses the `v6` branch of the docker-compose project.

To move an existing installation to a newer release, see [Upgrading](../upgrading/).

---

## Image tags

The image is published as `ghcr.io/ansibleforms/ansibleforms` on the GitHub Container
Registry, which belongs to the project and does not rate-limit anonymous pulls. Publication there starts at
7.1.2 (and 6.5.2 for the 6.x line), and all later releases are published there only.

The old Docker Hub repository, `ansibleguy/ansibleforms`, is no longer updated. It keeps its existing
releases but receives no new versions of either line. If you pull from it, switch
to `ghcr.io/ansibleforms/ansibleforms` with the same tag to keep receiving updates.

The following tags are available:

| Tag | Points to |
|---|---|
| `latest` | the newest release of the newest major version |
| `7`, `6` | the newest release of that major version |
| `7.0`, `6.5` | the newest release of that minor version |
| `7.0.1`, `6.5.3` | exactly that release |

`latest` only moves forward: a patch for an older major version (for example 6.5.3, released
after 7.0.0) moves `6` and `6.5`, but never `latest`.

To stay on a major version, use its number (`6`) instead of `latest`.
