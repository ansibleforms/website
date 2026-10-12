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
* **Coming from 6.5?** The 7 images run as uid 1000 instead of root: give that user the persistent folder once, with
  `sudo chown -R 1000:1000 /srv/apps/ansibleforms/server/persistent`.

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

Remove the old containers and start new ones with the same `run` commands you used at installation. The RTE reaches the
database like the app, and the app reaches the RTE on `RTE_URL`, over a network both containers share:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms ansibleforms-rte
docker rm ansibleforms ansibleforms-rte
docker run -p 8000:8000 -d -t --restart unless-stopped --network ansibleforms --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:7
docker run -d -t --restart unless-stopped --network ansibleforms --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms-rte -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password -e RTE_TOKEN=<token> -e RTE_URL=http://ansibleforms-rte:8000 ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms ansibleforms-rte
podman rm ansibleforms ansibleforms-rte
podman run -p 8000:8000 -d -t --restart unless-stopped --network ansibleforms --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:7
podman run -d -t --restart unless-stopped --network ansibleforms --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms-rte -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password -e RTE_TOKEN=<token> -e RTE_URL=http://ansibleforms-rte:8000 ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Coming from 6.5, there is no RTE container yet: the `stop` and `rm` commands only find the app. Create the shared network
once with `docker network create ansibleforms` (or `podman network create ansibleforms`), and choose a `RTE_TOKEN` of at
least 16 characters. Give the RTE the same `ENCRYPTION_SECRET` as the app when the app sets one. The RTE adds itself under
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

The RTE writes its own log, which `docker logs ansibleforms-rte` shows. In AnsibleForms, **Help → About** shows the version that is running, and **Settings → Status** shows the health of the
database, the schema and the other systems AnsibleForms depends on.

---

## Roll back

To go back to the release you ran before, the version **Help → About** showed before the upgrade, run step 2 again with
its exact tag in place of `7`, on both the AnsibleForms and the RTE image. If that release does not start on the upgraded
database, restore the backup you took under **Settings → Backups**.
