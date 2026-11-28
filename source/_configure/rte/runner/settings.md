---
layout: default
title: Settings
parent: RTE Runner
grand_parent: RTE
nav_order: 3
---

# The RTE Runner's settings
{: .no_toc }

Every environment variable the Runner reads, and its default
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The controller

These say how the Runner meets the controller; only `RTE_TOKEN` is always required.

| Variable | What it sets |
|---|---|
| `RTE_MODE` | `outbound` (default): it dials the controller. `inbound`: the controller dials it |
| `CONTROLLER_URL` | The controller's address as people open it: the one it dials (outbound), or registers with (inbound) |
| `CONTROLLER_TLS_VERIFY` | `1` (default) checks the controller's certificate. `0` accepts a self-signed one, in one trusted network only |
| `RTE_TOKEN` | Its own token, at least 16 characters: the controller keeps it for it once it joins |
| `RTE_JOIN_TOKEN` | A [join token](../../runners/registration.html#join-tokens) (`afj_...`) that approves it at once, the first time; else an admin approves it |
| `RTE_NAME` | Its name in the controller's runners (default `rte-<hostname>-<port>`) |
| `RTE_URL` | Inbound: its own address, the one the controller dials |

An outbound Runner needs `CONTROLLER_URL`. An inbound one with `CONTROLLER_URL` asks to join and needs `RTE_URL` too; without
`CONTROLLER_URL` it waits for the controller to dial it.

---

## The jobs

These say where and how its jobs run.

| Variable | What it sets |
|---|---|
| `RTE_MAX_JOBS` | How many jobs it runs at once, `10` by default (`0`: no limit) |
| `RTE_FILES` | `transfer` (default): the controller sends each job's files. `local`: they are mounted on the Runner |
| `RTE_CACHE_MB` | The most its cache of jobs' files takes on disk, in MB, `1024` by default (`0`: no cache) |
| `RTE_DRAIN_SECONDS` | `25` by default. Taken because the runner's page sets it, and unused: a job's container goes on through a restart |
| `RTE_IMAGE` | The image each job's container runs, with python and ansible-core in it (default `ghcr.io/ansibleforms/ansibleforms-rte-core:7`) |
| `RTE_ENGINE` | `docker`, `podman` or `kubernetes`: what runs the jobs' containers (default `kubernetes` in a pod, else `docker`) |
| `RTE_ENGINE_SOCKET` | The engine's socket (default `DOCKER_HOST` or `CONTAINER_HOST`, else `/var/run/docker.sock` or `/run/podman/podman.sock`) |
| `RTE_JOB_MOUNTS` | Docker and Podman: folders or files every job's container gets, `source:container[:ro\|rw]` separated by commas, read-only unless `rw`. The source is the Runner's own path, the host's folder behind it when it runs in a container |
| `PYTHONPATH` | Set on the Runner, it reaches every job too: for python libraries mounted with `RTE_JOB_MOUNTS` |

`RTE_MAX_JOBS`, `RTE_FILES`, `RTE_CACHE_MB` and `RTE_DRAIN_SECONDS` can also be set on the runner's page, under the RTE tab, as for
the Node RTE: a value there wins over the variable (see [An RTE's settings](../../runners/runner-page.html#an-rtes-settings)).

---

## Kubernetes

These are read on the `kubernetes` engine only.

| Variable | What it sets |
|---|---|
| `RTE_NAMESPACE` | The namespace of the jobs' pods (default: the Runner's own) |
| `RTE_RUNNER_IMAGE` | The Runner's own image, its binary copied into each job's pod (default: the image of its version) |
| `RTE_IMAGE_PULL_SECRETS` | The image pull secrets of the jobs' pods, separated by commas |

---

## The Runner itself

These set its folders, its port and its log.

| Variable | What it sets |
|---|---|
| `RTE_SPOOL_PATH` | Where each job's lines wait until the controller stored them (default `/app/dist/persistent/rte-spool`) |
| `RTE_CACHE_PATH` | Where the files the controller sent are kept (default `/app/dist/persistent/rte-files`) |
| `PORT` | Its `/live` and `/ready`, and the controller's socket in inbound mode (default `8000`) |
| `LOG_LEVEL` | `debug`, `info`, `notice` (default), `warning` or `error` |

The Runner's [.env.example](https://github.com/ansibleforms/runner/blob/main/.env.example) lists these settings with an example value.
