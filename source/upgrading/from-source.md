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

## Get the new code

Pull the new release into the folder you cloned at install time. Check the [changelog](../changelog) first: a new release
can raise the Node.js version it needs.

```bash
cd /srv/apps/ansibleforms
git pull
```

---

## Rebuild

Rebuild the client and copy it into the server again, and update the server's dependencies, exactly as at install time:

```bash
cd client
npm ci
npm run build

cd ../server
npm ci --omit=dev
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Your settings, forms, playbooks, certificates and logs live in `server/persistent`, which git and the build leave alone.
Compare `server/.env.example` with your `persistent/.env` to pick up any setting the release adds.

---

## Restart

Restart the application to load the new code; the database schema is upgraded at the first start:

```bash
pm2 restart ansibleforms
```

If you run it without PM2, stop `npm run start` and start it again.
