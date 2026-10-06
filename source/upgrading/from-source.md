---
layout: default
title: From source
parent: Upgrading
nav_order: 4
---

# From source
{: .no_toc }

Upgrade an installation built from source and run with PM2
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Get the new code

Pull the new release into the folder you cloned at install time, then update the Node.js dependencies of both applications:

```bash
cd /srv/apps/ansibleforms
sudo git pull

cd server
sudo npm install

cd ..
cd client
sudo npm install
```

## Rebuild and restart

Compile the client code and bundle it in the server code, then compile the server code, exactly as at install time:

```bash
sudo npm run bundle

cd ..
cd server
sudo npm run build
```

Your `.env.production` file lives in `./dist`, which the build rewrites: check it is still there (copy it back if needed), then restart:

```bash
cd dist
sudo pm2 restart ecosystem.config.js --env production
```

Compare your `.env` files with the new `.env.example` to pick up any setting the release adds.
