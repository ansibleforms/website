---
layout: default
title: Upgrading
nav_order: 3
has_children: true
has_toc: false
---

# Upgrading
{: .no_toc }

Move AnsibleForms to a newer release
{: .fs-6 .fw-300 }

---

For administrators of a running instance: move to a newer release, with the method you installed it with.

---

## In this section

The upgrade procedure depends on how you installed AnsibleForms. Each method is described on its own page:

| Page | What it covers |
|---|---|
| [Upgrading to v7](../upgrade-7.html) | What to change while still on 6.5, before you move to 7 |
| [Docker](docker.html) | Pull the new image and recreate the container with the same settings |
| [Docker Compose](docker-compose.html) | Pull the new image and restart the docker-compose project |
| [From source](from-source.html) | Pull the new code, rebuild it and restart the application |
| [Kubernetes](kubernetes.html) | Refresh the chart repository and run `helm upgrade` with your values |

{: .note }
> **Backup first** Take a backup before you upgrade (**Settings → Backups**). The database schema is upgraded at the first
> start of the new release, so the backup is your rollback point if something goes wrong.

The release you receive depends on the image tag you run: `latest` follows the newest major version, while a tag such as `7`
stays on that major version. All tags are listed under [Image tags](../installation/#image-tags).
