---
layout: default
title: Installation
nav_order: 2
has_children: true
has_toc: false
---

# Installation
{: .no_toc }

How to install AnsibleForms
{: .fs-6 .fw-300 }

---

AnsibleForms can be installed in a few ways. Each one has a page of its own:

* **[Docker](docker.html)** : Install MySql and spin-up the pre-built docker image with the correct environment variables
* **[Docker Compose](docker-compose.html)** : [Download the docker-compose project](https://github.com/ansibleforms/docker) and use docker-compose to start both MySql and AnsibleForms
* **[From source](from-source.html)** : You install everything manually, install all dependencies, build the code, start the code
* **[Kubernetes](kubernetes.html)** : Install the Helm chart and use Kubernetes to start AnsibleForms and its MySql database

{: .note }
> **Recommendation** Out of experience, I recommend the use of the docker-image. It has all (many) dependencies installed and can be setup very quickly. For AnsibleForms 6, use the `v6` branch of the docker-compose project.

To move an existing installation to a newer release, see [Upgrading](../upgrading/).

## Image tags

The image is published as `ghcr.io/ansibleforms/ansibleforms` on the GitHub Container
Registry, which belongs to the project and does not rate-limit anonymous pulls. It starts at
7.1.2 (and 6.5.2 for the 6.x line), and every release from now on is published there only.

The old Docker Hub repository, `ansibleguy/ansibleforms`, is no longer updated: it keeps the
releases it already has, but gets no new version of either line. If you pull from it, switch
to `ghcr.io/ansibleforms/ansibleforms` with the same tag to keep receiving updates.

The tags:

| Tag | Points to |
|---|---|
| `latest` | the newest release of the newest major version |
| `7`, `6` | the newest release of that major version |
| `7.0`, `6.5` | the newest release of that minor version |
| `7.0.1`, `6.5.3` | exactly that release |
| `7.1.0-rc.560.1` | a release candidate, built from a pull request to test it |
| `latest-rc` | the newest release candidate - or `latest`, when that is newer |

`latest` only ever moves forward: a patch for an older major version (say 6.5.3, released
after 7.0.0) moves `6` and `6.5`, never `latest`. To stay on a major version, use its
number (`6`) instead of `latest`. A release candidate is for testing only: once its fix is
released, move to `latest` (or the version) yourself.
