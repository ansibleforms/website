---
layout: default
title: From source
parent: Upgrading
nav_order: 3
---

# From source
{: .no_toc }

Upgrade an installation built from source
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

An installation built from source is upgraded by checking out the new release, rebuilding it and restarting the
application. Your settings, forms, playbooks, certificates and logs are stored in `server/persistent`, which Git and the
build do not modify.

---

## Before you upgrade

Prepare the upgrade so that you can go back if something goes wrong:

* **Take a backup** under **Settings → Backups**. The new release upgrades the database schema at its first start.
* **Read the [changelog](../changelog)** for the releases between your version and the new one.
* **Moving to a new major version?** Follow [Upgrading to v7](../upgrade-7.html) first.
* **Check the Node.js version** the new release requires, in the changelog.

---

## 1. Get the new release

Fetch the release tags and check out the release you want. Release tags carry the version number, and `git tag` lists
them; the `main` branch can hold changes that are not released yet:

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Rebuild

Rebuild in the same three steps as at installation. First rebuild the client:

```bash
cd client
npm ci
npm run build
```

Then update the server's dependencies:

```bash
cd ../server
npm ci --omit=dev
```

Finally copy the rebuilt client into the server's `views` folder again:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Compare `.env.example`, at the repository root, with your `persistent/.env` to pick up any settings that the release adds.

---

## 3. Restart

Restart the application and its RTE to load the new code. The database schema is upgraded at the first start:

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Coming from 7.2, the RTE ran in database mode, with the database settings and `RTE_URL`, deprecated in 7.3.0 and removed in 8.0.0.
Start it again in inbound mode, and declare its runner with an RTE credential in the seed or under **Connections → Runners**, as the
[installation](../installation/from-source.html#run) shows: `pm2 delete ansibleforms-rte`, then its `pm2 start` command.

If you run the application without PM2, stop `npm run start` and start it again.

---

## 4. Check the upgrade

Follow the application log while it starts:

```bash
pm2 logs ansibleforms
```

In AnsibleForms, **Help → About** shows the version that is running, and **Settings → Status** shows the health of the
database, the schema and the other systems AnsibleForms depends on.

---

## Roll back

To go back to the release you ran before, the version **Help → About** showed before the upgrade, check out its tag with
`git checkout <version>`, then rebuild and restart as in steps 2 and 3. If that release does not start on the upgraded database, restore the backup you took under
**Settings → Backups**.
