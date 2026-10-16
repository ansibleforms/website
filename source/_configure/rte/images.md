---
layout: default
title: Images
parent: RTE
nav_order: 1
---

# RTE images
{: .no_toc }

The three published RTE images, and an RTE of your own with the collections and libraries your playbooks use
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The RTE images

The RTE is published in three layers, each built on the one before, with the same tags as the app (see [Image tags](../installation/#image-tags)):

| Image | What is in it | Use it |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js and the AnsibleForms server, git, ssh and sshpass. No python and no ansible, so it runs no playbook by itself | To build an RTE with your own python and ansible versions |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | The base, plus python 3.14, ansible-core and a few common libraries (`jmespath`, `netaddr`, `requests`, `paramiko`). No collections | To build a smaller RTE with only the collections and libraries your playbooks use |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | The core, plus the `ansible` package on the same ansible-core, and what the AnsibleForms 6.5 image had: the NetApp, AWS and community collections, `pandas`, `pyvmomi`, `boto3`, the mariadb client, ytt and a few os tools | **The default.** Run it as it is: playbooks from 6.5 find what they used |

Like the app image, every layer runs as the user `node` (uid 1000), and the playbooks run as that user too.

---

## Build your own RTE

Build on `ansibleforms-rte-core` and add the collections and python libraries your playbooks use. This NetApp example is one of
the Dockerfiles in [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

The python environment and the collections folder belong to `node`, so these installs need no root. A layer that installs os
packages switches to `USER root` for them and back to `USER node` at the end. To bring your own python and ansible, build on
`ansibleforms-rte-base` (`Dockerfile.own-ansible` in the same folder).

Keep the image on the app's release: `:7` follows the app's `:7`, and an exact `7.x.y` pins both. What the app and an RTE must
share is their contract, a number both report: 7.0.0 brought contract 2, so an RTE of an older 7 release keeps working with a newer
app as long as both still speak contract 2. When a release changes the contract, its release notes say that RTEs must be updated,
the RTE refuses the app's jobs, and **Test connection** on the runner and the **Status** page show it in red.

Collections and roles can also be mounted instead of baked in, at `/etc/ansible/collections` and `/etc/ansible/roles`. Then no
rebuild is needed per change, but what runs depends on that volume; python libraries always go into the image. Baking everything
in is reproducible and starts fast, which makes it the way for production.
