---
layout: default
title: Docker Compose
parent: Upgrading
nav_order: 2
---

# Docker Compose
{: .no_toc }

Upgrade an installation made with the docker-compose project
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

The docker-compose project runs three containers: MySQL (`mysqldb`), AnsibleForms (`app`) and the RTE that runs the
playbooks (`rte`). AnsibleForms and the RTE use the image tag `7`, which always points to the newest 7.x release. An
upgrade pulls the images again and recreates the containers whose image changed. Everything that must persist is stored
in the `data` folder and is preserved.

---

## Before you upgrade

Prepare the upgrade so that you can go back if something goes wrong:

* **Take a backup** under **Settings → Backups**. The new release upgrades the database schema at its first start.
* **Read the [changelog](../changelog)** for the releases between your version and the new one.
* **Moving to a new major version?** Follow [Upgrading to v7](../upgrade-7.html) first.
* **Coming from 6.5?** The 6.x project, on its `v6` branch, has no `rte` container. Update your copy of the project to
  its `main` branch, keeping your `.env` settings and your `data` folder, so that `docker-compose.yml` has the `rte`
  service. The 7 images run as uid 1000 instead of root: give that user the `data` folder once, leaving the MySQL
  files to MySQL, with `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  The `data/ssh` folder is now mounted at `/home/node/.ssh` instead of `/root/.ssh`.

---

## 1. Pull the new images

Download the newest images of the tags in `docker-compose.yml`:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. Recreate the containers

Start the project again; the containers whose image changed are recreated:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. Check the upgrade

Follow the AnsibleForms log while it starts. The first start of a new release upgrades the database schema, and the RTE
starts once AnsibleForms is healthy:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

In AnsibleForms, **Help → About** shows the version that is running, and **Settings → Status** shows the health of the
database, the schema and the other systems AnsibleForms depends on.

---

## Roll back

To go back to the previous release, pin its exact tag in `docker-compose.yml`, for example
`image: ghcr.io/ansibleforms/ansibleforms:7.1.6`, and run step 2 again. If that release does not start on the upgraded
database, restore the backup you took under **Settings → Backups**. Set the tag back to `7` to receive updates again.

**VIDEO**: [How to upgrade AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
