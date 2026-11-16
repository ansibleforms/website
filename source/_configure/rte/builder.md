---
layout: default
title: The RTE builder
parent: RTE
nav_order: 6
---

# The RTE builder
{: .no_toc }

Run the builder that builds and pushes the RTE images the Designer defines
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## What it is

The RTE builder is a small product of its own, [ansibleforms/builder](https://github.com/ansibleforms/builder), released with every AnsibleForms release at the same version.

It joins the controller as a runner does, with a join token or an admin's approval, and is listed under **Settings > Connections > Builders**.
When someone builds an RTE image, the controller writes its Dockerfile and hands the build to a builder that is online,
with the registry login and the signing key sealed for that builder. The builder builds it with BuildKit, pushes it, signs it when asked,
and streams the build's log back as a job on the **Jobs** page.

A builder needs a controller with RTE images, AnsibleForms 7.8.0 or later. It never reads the controller's database nor its repositories, and runs no playbook.

---

## Before you start

A builder dials the controller and the registries it pushes to; nothing needs to reach it.

1. Open **Settings > Connections > Builders** and click **New builder**: it makes a join token and shows the command below with it.
2. Choose the builder's own token, `RTE_TOKEN`: at least 16 characters, kept by the controller once it joins.

---

## Docker

The builder runs its own rootless BuildKit, which needs two security options to make its user namespaces.

```bash
docker run -d --name af-builder --restart unless-stopped \
  --security-opt seccomp=unconfined --security-opt apparmor=unconfined \
  -e CONTROLLER_URL=https://forms.example.com \
  -e RTE_TOKEN=<at least 16 characters> -e RTE_JOIN_TOKEN=<the join token> \
  -e RTE_NAME=builder-1 -v af-builder:/home/node/work \
  ghcr.io/ansibleforms/ansibleforms-rte-builder:7
```

---

## Docker Compose

The same as a service, its work folder on a volume so BuildKit's cache survives a restart.

```yaml
services:
  builder:
    image: ghcr.io/ansibleforms/ansibleforms-rte-builder:7
    restart: unless-stopped
    security_opt: [seccomp=unconfined, apparmor=unconfined]
    environment:
      CONTROLLER_URL: https://forms.example.com
      RTE_TOKEN: ${RTE_TOKEN}
      RTE_JOIN_TOKEN: ${RTE_JOIN_TOKEN}
      RTE_NAME: builder-1
    volumes:
      - builder:/home/node/work
volumes:
  builder:
```

---

## Kubernetes

A Deployment with one replica per builder, in a pod whose security context allows its user namespaces.

Where those options are not allowed, run BuildKit as its own service (the BuildKit project's Helm chart or manifests)
and point the builder at it with `BUILDKIT_HOST=tcp://buildkitd:1234`: the builder then needs no special option.

---

## Settings

Each setting is an environment variable of the builder's container; only the first two are required.

| Variable | What it sets |
|---|---|
| `CONTROLLER_URL` | The controller's address, as people open it |
| `RTE_TOKEN` | Its own token, at least 16 characters |
| `RTE_JOIN_TOKEN` | A join token that approves it at once, the first time |
| `RTE_NAME` | Its name in RTE builders (default `builder-<hostname>-<port>`) |
| `CONTROLLER_TLS_VERIFY` | `0` accepts the controller's self-signed certificate, in one trusted network only |
| `BUILDKIT_HOST` | Another BuildKit to build with; empty, its own rootless one |
| `BUILDER_WORK_PATH` | Its spool, its builds' files and BuildKit's cache (`/home/node/work`) |
| `HTTPS_PROXY`, `NO_PROXY` | The proxy it dials the controller through |
| `PORT` | Its `/live` and `/ready` (8000) |
| `LOG_LEVEL` | `debug`, `info`, `notice` (default), `warning` or `error` |

---

## Troubleshooting

The builder's log says why it cannot start or join; a build's own errors are in its job's log.

| What you see | What to check |
|---|---|
| `buildkitd stopped`, `failed to setup UID/GID map` | Run it with the two security options, or set `BUILDKIT_HOST` |
| A dial refused with 401 | Its `RTE_TOKEN` is not the one the controller keeps, or the join token is used up, expired or revoked |
| A dial refused with 409 | A runner, not a builder, has its name: set another `RTE_NAME` |
| `waiting for an admin to approve it` | Approve it in **Settings > Connections > Builders** |
| A push says `unauthorized` | The registry credential's user, password or token |
| `server gave HTTP response to HTTPS client` | The registry is plain http: give its credential an `http://` address |
| Signing fails with `decrypt` | The signing key credential's password is not the key's; the image is pushed, unsigned |
