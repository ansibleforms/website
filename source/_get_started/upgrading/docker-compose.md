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
  service. That compose file sets `CONFIG_SEED_PATH`, and a 6.x `data` folder has no `seed.yaml`: copy `data/seed.yaml` from
  the repository, and add `RTE_TOKEN` (at least 16 characters) to your `.env`, as the repository's `.env` has it. Without them the
  app refuses to start. The 7 images run as uid 1000 instead of root: give that user the `data` folder once, leaving the MySQL
  files to MySQL, with `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  The `data/ssh` folder is now mounted at `/home/node/.ssh` instead of `/root/.ssh`.
* **Coming from 7.2?** Update `docker-compose.yml` and `data/seed.yaml` together: see [From 7.2 to 7.3](#from-72-to-73) first.

---

## From 7.2 to 7.3

Up to 7.2.0 the `rte` service got the database's settings and its runner, declared in `data/seed.yaml`, ran in database mode,
deprecated in 7.3.0 and removed in 8.0.0. Since 7.3.0 the app dials the RTE on `http://rte:8000` and keeps one WebSocket open
(`RTE_MODE=inbound`, see [Modes](../rte/modes.html)), and the RTE holds no database settings. Take both files from the repository's
`main` branch, keeping your `.env`:

| File | What changes |
|---|---|
| `docker-compose.yml` | The `rte` service no longer reads `.env`: it gets `RTE_MODE=inbound`, `RTE_TOKEN` and `RTE_FILES=local`, and no `DB_*` |
| `data/seed.yaml` | An RTE credential `rte`, with `url: http://rte:8000` and `password: ${RTE_TOKEN}`, and the runner `rte` with `rte_mode: inbound` and `credential: rte` |

Change both. With only the new compose file, the seed keeps the runner `rte` in database mode: the app calls the RTE as a 7.2 one,
which the new RTE does not answer, and no playbook runs. A seed you changed yourself needs the same credential and `rte_mode`.

A runner the seed created stays managed, read-only under **Connections → Runners**, even after you remove `CONFIG_SEED_PATH`: only a
seed that is applied releases a runner it no longer declares. So keep the seed and set `rte_mode` there, rather than removing
`CONFIG_SEED_PATH` to change the runner by hand.

The [installer](../installation/installer.html#upgrade) does this on its own: its upgrade replaces `docker-compose.yml`, and `data/seed.yaml`
when it is one the repository shipped, unchanged. One changed by hand is kept, and the new one is saved beside it.

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

To go back to the release you ran before, the version **Help → About** showed before the upgrade, pin its exact tag in
`docker-compose.yml` on both the AnsibleForms and the RTE image, in place of `7`, and run step 2 again. If that release
does not start on the upgraded database, restore the backup you took under **Settings → Backups**. Set the tags back to
`7` to receive updates again.

**VIDEO**: [How to upgrade AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
