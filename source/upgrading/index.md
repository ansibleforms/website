---
layout: default
title: Upgrading
nav_order: 2.4
has_children: true
has_toc: false
---

# Upgrading
{: .no_toc }

How to move AnsibleForms to a newer release
{: .fs-6 .fw-300 }

---

How you upgrade depends on how you installed AnsibleForms. Each way has a page of its own:

* **[Docker](docker.html)** : pull the new image and recreate the container with the same settings
* **[Docker Compose](docker-compose.html)** : pull the new image and restart the docker-compose project
* **[From source](from-source.html)** : pull the new code, rebuild it and restart the application
* **[Kubernetes](kubernetes.html)** : refresh the chart repository and run `helm upgrade` with your values
* **[Upgrading to 7](../upgrade-7.html)** : what to change while still on 6.5, before you move to 7

{: .note }
> **Backup first** Take a backup before you upgrade (**Settings → Backups**). The database schema is upgraded at the first
> start of the new release, so a backup is what you roll back to when something goes wrong.

Which release you get depends on the image tag you run: `latest` follows the newest major version, a tag such as `7` stays on
that major version. All tags are listed under [Image tags](../installation/#image-tags).
