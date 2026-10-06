---
layout: default
title: Docker
parent: Upgrading
nav_order: 2
---

# Docker
{: .no_toc }

Upgrade an image run on its own, without docker-compose
{: .fs-6 .fw-300 }

---

Pull the new image, remove the old container and start a new one with the same `docker run` command you installed with:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker stop ansibleforms
docker rm ansibleforms
docker run -p 8000:8000 -d -t --mount type=bind,source=/srv/apps/ansibleforms/server/persistent,target=/app/dist/persistent --name ansibleforms -e DB_HOST=192.168.0.1 -e DB_USER=root -e DB_PASSWORD=password ghcr.io/ansibleforms/ansibleforms:7
```

Your forms, playbooks, logs and certificates live in the mounted `/app/dist/persistent` folder and the data in MySQL, so both are kept.
