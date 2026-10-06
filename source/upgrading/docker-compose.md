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

---

Upgrading is as simple as pulling the new image and restarting the project:

```bash
cd /srv/apps/ansibleforms-docker
sudo docker-compose pull
sudo docker-compose down
sudo docker-compose up -d
```

Everything that must survive an upgrade lives in the `data` folder, so it is kept. With Podman, use `podman-compose` instead.

**VIDEO**: [How to upgrade AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
