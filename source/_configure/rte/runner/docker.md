---
layout: default
title: Docker and Podman
parent: RTE Runner
grand_parent: RTE
nav_order: 1
---

# The RTE Runner on Docker and Podman
{: .no_toc }

Run the Runner on a container host, its jobs in containers next to it
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Before you start

The Runner starts a container per job through the engine's API, so it needs the engine's socket and nothing else of the host.

1. Pick a token for it, at least 16 characters, as `RTE_TOKEN`: the controller keeps it for it once it joins.
2. Optionally, have a [join token](../../runners/registration.html#join-tokens) (`afj_...`) as `RTE_JOIN_TOKEN`: it approves the
   Runner at once, the first time. Without one, an admin approves it under **Connections > Runners** (see
   [Approving an RTE](../../runners/registration.html#approving-an-rte)).
3. Give it a name with `RTE_NAME`: without one it is called `rte-<hostname>-<port>`, which changes with the container.

Each job's container runs the image `RTE_IMAGE` names, `ghcr.io/ansibleforms/ansibleforms-rte-core:7` by default: the host pulls it
when it does not have it.

---

## Docker

Mount the Docker socket, and give the Runner's user (uid 1000) the socket's group so it may open it.

```bash
docker run -d --name af-runner --restart unless-stopped \
  -e RTE_MODE=outbound -e CONTROLLER_URL=https://forms.example.com \
  -e RTE_NAME=runner-1 -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_JOIN_TOKEN=<a join token, afj_...> \
  -v /var/run/docker.sock:/var/run/docker.sock --group-add "$(stat -c %g /var/run/docker.sock)" \
  -v af-runner:/app/dist/persistent \
  ghcr.io/ansibleforms/ansibleforms-rte-runner:7
```

The volume on `/app/dist/persistent` holds its spool and its files cache: keep it, so a restarted Runner reads on where it stopped.
Nothing needs to reach an outbound Runner: publish no port.

---

## Docker Compose

The same as a service, its state on a named volume.

```yaml
services:
  runner:
    image: ghcr.io/ansibleforms/ansibleforms-rte-runner:7
    restart: unless-stopped
    environment:
      RTE_MODE: outbound
      CONTROLLER_URL: https://forms.example.com
      RTE_NAME: runner-1
      RTE_TOKEN: ${RTE_TOKEN}
      RTE_JOIN_TOKEN: ${RTE_JOIN_TOKEN}
    group_add:
      - ${DOCKER_GID}           # the group of /var/run/docker.sock on the host
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner:/app/dist/persistent
volumes:
  runner:
```

---

## Podman

Set `RTE_ENGINE=podman` and mount the Podman socket where the Runner looks for it, `/run/podman/podman.sock`.

```bash
podman run -d --name af-runner --restart unless-stopped \
  -e RTE_MODE=outbound -e CONTROLLER_URL=https://forms.example.com \
  -e RTE_NAME=runner-1 -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_ENGINE=podman \
  -v /run/podman/podman.sock:/run/podman/podman.sock \
  -v af-runner:/app/dist/persistent \
  ghcr.io/ansibleforms/ansibleforms-rte-runner:7
```

The Runner runs as uid 1000, so that user must be able to open the socket. A rootless Podman's socket is under
`$XDG_RUNTIME_DIR/podman/podman.sock`: mount that one instead. A socket mounted elsewhere is named with `RTE_ENGINE_SOCKET`.

---

## Inbound

An inbound Runner listens on its `PORT`, and the controller dials it there.

```bash
docker run -d --name af-runner --restart unless-stopped -p 8000:8000 \
  -e RTE_MODE=inbound -e CONTROLLER_URL=https://forms.example.com \
  -e RTE_URL=http://runner-1.example.com:8000 \
  -e RTE_NAME=runner-1 -e RTE_TOKEN=<at least 16 characters> \
  -v /var/run/docker.sock:/var/run/docker.sock --group-add "$(stat -c %g /var/run/docker.sock)" \
  -v af-runner:/app/dist/persistent \
  ghcr.io/ansibleforms/ansibleforms-rte-runner:7
```

With `CONTROLLER_URL` it asks to join, and `RTE_URL` is the address the controller dials. Without `CONTROLLER_URL` it makes no call:
add its runner under **Connections > Runners**, type RTE, mode **Inbound**, as [Inbound](../modes.html#inbound) shows.

---

## The binary

Each release of [ansibleforms/runner](https://github.com/ansibleforms/runner/releases) has static Linux binaries for amd64 and arm64.

```bash
curl -fLO https://github.com/ansibleforms/runner/releases/latest/download/ansibleforms-rte-runner_linux_amd64
curl -fLO https://github.com/ansibleforms/runner/releases/latest/download/SHA256SUMS
sha256sum --check --ignore-missing SHA256SUMS
install -m 0755 ansibleforms-rte-runner_linux_amd64 /usr/local/bin/ansibleforms-rte-runner
```

It reads the same [settings](settings.html) from its environment and still runs each job in a container, so the host needs Docker
or Podman, and the binary's user needs access to the socket. It copies itself into each job's container. Its spool and files cache
default to folders under `/app/dist/persistent`: on a host, point `RTE_SPOOL_PATH` and `RTE_CACHE_PATH` at folders of your own.

```bash
RTE_MODE=outbound CONTROLLER_URL=https://forms.example.com \
RTE_NAME=runner-1 RTE_TOKEN=<at least 16 characters> \
RTE_SPOOL_PATH=/var/lib/af-runner/spool RTE_CACHE_PATH=/var/lib/af-runner/files \
ansibleforms-rte-runner
```

`ansibleforms-rte-runner version` prints its version, and `ansibleforms-rte-runner health` checks that a running one listens on its `PORT`.
