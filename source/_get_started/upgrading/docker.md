---
layout: default
title: Docker
parent: Upgrading
nav_order: 1
---

# Docker
{: .no_toc }

Upgrade a standalone container, without docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

A standalone installation is upgraded by replacing its containers: pull the new images, remove the old containers and
start new ones with the same `run` commands. Since version 7 there are two: AnsibleForms and the RTE that runs the
playbooks, always on the same release. Your files are stored in the mounted `/app/dist/persistent` folder and your data in
MySQL, so both are preserved.

---

## Before you upgrade

Prepare the upgrade so that you can go back if something goes wrong:

* **Take a backup** under **Settings → Backups**. The new release upgrades the database schema at its first start.
* **Read the [changelog](../changelog)** for the releases between your version and the new one.
* **Moving to a new major version?** Follow [Upgrading to v7](../upgrade-7.html) first.
* **Coming from 6.5?** The 7 images run as uid 1000 instead of root: give that user the folders you mount once, for
  example `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.

---

## 1. Pull the new images

Download the newest AnsibleForms and RTE images of the tag you run:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. Replace the containers

Remove the old containers and start new ones with the same `run` commands you used at
[installation](../installation/docker.html). Both read the database connection from the same environment file, with the
database user of AnsibleForms (not root), and the app reaches the RTE on `RTE_URL`, over a network both containers share:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -e RTE_TOKEN='<at least 16 characters>' -e RTE_URL=http://rte:8000 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -e RTE_TOKEN='<at least 16 characters>' -e RTE_URL=http://rte:8000 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Coming from 6.5, there is no RTE container yet: the `stop` and `rm` commands only find the app. Create the shared network
once with `docker network create ansibleforms` (or `podman network create ansibleforms`), put the database connection and
`ENCRYPTION_SECRET` in the environment file as the [installation](../installation/docker.html) does, and choose a
`RTE_TOKEN` of at least 16 characters. Use your own folders where your 6.5 installation mounted others. The RTE adds itself under
**Connections → Runners** as the default runner; see [Upgrading to v7](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Check the upgrade

Follow the AnsibleForms log while it starts. The first start of a new release upgrades the database schema:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

The RTE writes its own log, which `docker logs rte` shows. In AnsibleForms, **Help → About** shows the version that is running, and **Settings → Status** shows the health of the
database, the schema and the other systems AnsibleForms depends on.

---

## Roll back

To go back to the release you ran before, the version **Help → About** showed before the upgrade, run step 2 again with
its exact tag in place of `7`, on both the AnsibleForms and the RTE image. If that release does not start on the upgraded
database, restore the backup you took under **Settings → Backups**.
