---
layout: default
title: RTE Runner
parent: RTE
nav_order: 7
has_children: true
has_toc: false
permalink: /rte/runner/
---

# The RTE Runner in Go
{: .no_toc }

A Runner in Go that runs each job in a container of its own
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators: what the RTE Runner is, how it differs from the Node RTE, and where to run it.

| Page | What it covers |
|---|---|
| [Docker and Podman](docker.html) | Run it on a container host, from its image or as a static binary |
| [Kubernetes](kubernetes.html) | Run it in a cluster, each job in a pod of its own, and the Role it needs |
| [Settings](settings.html) | Every environment variable it reads, and its default |

---

## What it is

The RTE Runner is a product of its own, [ansibleforms/runner](https://github.com/ansibleforms/runner): the RTE ported to Go.

It joins the controller as an RTE does and runs the playbooks and workflows the controller hands it. Unlike the Node RTE, it runs no
playbook in its own container: each job runs in a fresh container of its own, on Docker, Podman or Kubernetes, removed once the job ends.

It speaks the socket modes only: `outbound` and `inbound` (see [Modes](../modes.html)). The deprecated database mode stays on the
Node RTE until 8.0. An RTE still in database mode moves to a socket mode first, as [Database (deprecated)](../modes.html#database-deprecated) shows.

---

## How it works

The controller hands each job to one of its Runners, with the playbook's files and the job's credentials sealed for it.

1. **The job's container** : the Runner starts a container of [`RTE_IMAGE`](settings.html) for the job, and writes the job on its
   stdin: its files, extra vars and secrets
2. **The run** : in that container the Runner's own binary runs the playbook with the image's ansible-core, with its inventory,
   credentials, limit and extra vars
3. **The output** : the job's output, events and end come back as numbered lines, which the Runner reads as the container's logs and
   sends to the controller, its secrets masked
4. **The end** : the container is removed once the job ends. An abort stops the container

Nothing is shared on the network or on a disk between the Runner and its jobs. A restarted Runner finds its jobs' containers and reads
on where it stopped, and what the controller did not store yet is sent again after a reconnect.

---

## Modes and engines

Two settings shape a Runner: how it meets the controller, and what runs its jobs' containers.

| `RTE_MODE` | How it joins |
|---|---|
| `outbound` (default) | It dials the controller and keeps one socket open: no port to open on the Runner's side |
| `inbound` | The controller dials it: for a Runner the controller can reach, but not the other way round |

| `RTE_ENGINE` | What the Runner needs |
|---|---|
| `docker` | The Docker socket mounted (`RTE_ENGINE_SOCKET` or `DOCKER_HOST` when it is elsewhere) |
| `podman` | The Podman socket mounted (`RTE_ENGINE_SOCKET` or `CONTAINER_HOST` when it is elsewhere) |
| `kubernetes` | A pod whose service account has the [Role](kubernetes.html#the-role) it needs |

Without `RTE_ENGINE` it picks `kubernetes` when it runs in a pod, else `docker`.

A Runner joins as an RTE does: it asks to join and waits for an admin's approval, or a [join token](../../runners/registration.html#join-tokens)
approves it at once (see [Registration](../../runners/registration.html)).

---

## The jobs' image

Every job runs in the image `RTE_IMAGE` names: `ghcr.io/ansibleforms/ansibleforms-rte-core:7` by default.

The image brings python and ansible-core, and the collections and libraries the playbooks use. The Runner itself brings neither: it is
one small binary, without Node.js or Python. Another of the [RTE images](../images.html), or one of your own with python and
ansible-core, works too: build it as [Build your own RTE](../images.html#build-your-own-rte) shows.

---

## Next to the Node RTE

Both are runners of type RTE to the controller, and a controller may have some of each.

| | Node RTE | RTE Runner |
|---|---|---|
| Written in | Node.js, the AnsibleForms server with `AF_ROLE=rte` | Go, one static binary |
| Modes | `outbound`, `inbound`, and `database` (deprecated) | `outbound` and `inbound` |
| Where a playbook runs | In the RTE's own container, as a child process | In a fresh container per job, of `RTE_IMAGE` |
| What it needs | python and ansible in its own image | A Docker or Podman socket, or a Role on Kubernetes |
| Image | `ansibleforms-rte-base`, `-core` or `-full` | `ghcr.io/ansibleforms/ansibleforms-rte-runner` |

---

## Releases

The Runner's version follows AnsibleForms': each release of the app has a Runner of the same version, from 7.8.0 on.

Each release publishes the image `ghcr.io/ansibleforms/ansibleforms-rte-runner` for amd64 and arm64, and static Linux binaries for
amd64 and arm64 with their `SHA256SUMS`, on the [releases](https://github.com/ansibleforms/runner/releases) of ansibleforms/runner.
Its changes are in its [changelog](https://github.com/ansibleforms/runner/blob/main/CHANGELOG.md).

A Runner works with any controller of the same socket contract, whatever its release.
