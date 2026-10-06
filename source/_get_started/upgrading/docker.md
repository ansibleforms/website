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

A standalone container is upgraded by replacing it: pull the new image, remove the old container and start a new one
with the same `run` command. Your files are stored in the mounted `/app/dist/persistent` folder and your data in MySQL,
so both are preserved.

---

## Before you upgrade

Prepare the upgrade so that you can go back if something goes wrong:

* **Take a backup** under **Settings → Backups**. The new release upgrades the database schema at its first start.
* **Read the [changelog](../changelog)** for the releases between your version and the new one.
* **Moving to a new major version?** Follow [Upgrading to v7](../upgrade-7.html) first.

---

## 1. Pull the new image

Download the newest image of the tag you run:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
```

</div>
</div>

---

## 2. Replace the container

Remove the old container and start a new one with the same `run` command you used at installation:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms
docker rm ansibleforms
docker run -p 8000:8000 -d -t --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms
podman rm ansibleforms
podman run -p 8000:8000 -d -t --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:7
```

</div>
</div>

---

## 3. Check the upgrade

Follow the container log while it starts. The first start of a new release upgrades the database schema:

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

In AnsibleForms, **Help → About** shows the version that is running, and **Settings → Status** shows the health of the
database, the schema and the other systems AnsibleForms depends on.

---

## Roll back

To go back to the previous release, run step 2 again with its exact tag, for example
`ghcr.io/ansibleforms/ansibleforms:7.1.6`. If that release does not start on the upgraded database, restore the backup you
took under **Settings → Backups**.
