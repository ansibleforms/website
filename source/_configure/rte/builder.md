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

It is added as a runner is, under **Settings > Connections > Builders**, and dials the controller with its name and token.
When someone builds an RTE image, the controller writes its Dockerfile and hands the build to a builder that is online,
with the registry login and the signing key sealed for that builder. The builder builds it with BuildKit, pushes it, signs it when asked,
and streams the build's log back as a job on the **Jobs** page.

A builder needs a controller with RTE images, AnsibleForms 7.8.0 or later. It never reads the controller's database nor its repositories, and runs no playbook.

---

## Before you start

A builder dials the controller and the registries it pushes to; nothing needs to reach it.

1. Open **Settings > Connections > Builders** and click **New**: give the builder a name, then choose its **Credential**, an RTE
   token credential (**New credential** under the list makes one, with a token of at least 16 characters).
2. Start the builder with that name as `RTE_NAME` and that credential's token as `RTE_TOKEN`: it connects at once.

A builder started without one asks to join instead: an admin approves it in the notice above the list, or a join token
(`RTE_JOIN_TOKEN`) approves it the first time.

---

## Docker

The builder runs its own rootless BuildKit, which needs two security options to make its user namespaces.

```bash
docker run -d --name af-builder --restart unless-stopped \
  --security-opt seccomp=unconfined --security-opt apparmor=unconfined \
  -e CONTROLLER_URL=https://forms.example.com \
  -e RTE_NAME=builder-1 -e RTE_TOKEN=<its credential's token> \
  -v af-builder:/home/node/work \
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
      RTE_NAME: builder-1
      RTE_TOKEN: ${RTE_TOKEN}
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

Each setting is an environment variable of the builder's container; only the first three are required.

| Variable | What it sets |
|---|---|
| `CONTROLLER_URL` | The controller's address, as people open it |
| `RTE_NAME` | Its name under **Builders** (default `builder-<hostname>-<port>`) |
| `RTE_TOKEN` | The token of its credential, at least 16 characters |
| `RTE_JOIN_TOKEN` | Only for a builder not added in **New**: a join token that approves it the first time |
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
| A dial refused with 401 | Its `RTE_NAME` or `RTE_TOKEN` is not the builder's name and its credential's token, or the join token is used up, expired or revoked |
| A dial refused with 409 | A runner, not a builder, has its name: set another `RTE_NAME` |
| `waiting for an admin to approve it` | Approve it in **Settings > Connections > Builders** |
| A push says `unauthorized` | The registry credential's user, password or token |
| `server gave HTTP response to HTTPS client` | The registry is plain http: give its credential an `http://` address |
| Signing fails with `decrypt` | The signing key credential's password is not the key's; the image is pushed, unsigned |
