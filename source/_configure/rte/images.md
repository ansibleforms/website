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

From 7.6.0 every layer is published for `linux/amd64` and `linux/arm64` under the same tag. An RTE you build on one is built for the
architecture of the machine that builds it: for arm64 hosts, build it on one, or with `docker buildx build --platform linux/arm64`.

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

Keep the image on the app's release: `:7` follows the app's `:7`. Collections and roles can also be mounted instead of baked in, at
`/etc/ansible/collections` and `/etc/ansible/roles`. Then no rebuild is needed per change, but what runs depends on that volume;
python libraries always go into the image. Baking everything in is reproducible and starts fast, which makes it the way for production.

---

## Build it in the Designer

From 7.8.0 you describe an RTE in the Designer and a [builder](builder.html) builds it, pushes it to your registry and signs it.

1. Give a repository the **RTE images** usage (Settings > Repositories); it holds the definitions.
2. In the Designer, open **RTE images** and click **New**: fill in the image on the **Visual** tab, or write it on the **YAML** tab.
3. **Save**, then **Push** to commit it to the repository, and **Build**: the build is a job on the **Jobs** page, its log live.

Each image is a folder of its own in the repository, named after it, that holds only its definition:

```text
rte-netapp/
  rte.yaml
```

The Dockerfile, `ansible.cfg` and the requirements files are written again for every build, from the definition and the app's
release, so they never go stale in the repository. The **Files** tab shows them as the builder gets them.

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    python: "3.14"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      name: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      key: cosign-key
```

Every key but the name can be left out; the **YAML** tab's toolbar sets each part in a dialog.

| Key | What it is |
|---|---|
| `name` | The image's name and its folder's: lower case letters, digits, dots, dashes and underscores |
| `python` | The python the image runs, from 3.11 to 3.15; 3.14 when left out |
| `ansible_core` | An ansible-core release (`2.22`) or version (`2.22.0`) that runs on that python; the newest one that does when left out |
| `ansible_collections` | The collections, each its `name` (namespace.name) and an optional `version`; the latest when left out |
| `python_packages` | Python packages, as lines of a `requirements.txt` |
| `os_packages` | Debian 13 (trixie) packages |
| `registry` | `name`: a **Container registry** credential, which holds the registry's address and login; `path`: the image's path in it, its name when left out; `tag`: `app`, the app's release (`7.8.0`), so a rebuild follows each upgrade, or a tag of your own |
| `sbom` | `true` attaches a software bill of materials to the image |
| `sign` | `key`: a **Signing key** credential, with which the builder signs the image with cosign |

Every image is built from `ansibleforms-rte-base` of the app's release, so an image tagged `app` built for an older release
is shown as such on the **RTE images** page, with **Rebuild all**.

---

## The contract

What the app and an RTE must share is their contract, a number both report. An RTE of an older release keeps working with a newer
app as long as both speak the same contract; when a release changes it, its release notes say that RTEs must be updated. Each mode
has its own:

| Mode | Contract | On a mismatch |
|---|---|---|
| Outbound, Inbound | 3, new in 7.3.0 | The app closes the RTE's socket with the code `4409` and logs *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. An outbound RTE logs *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. A job sent with another contract is refused |
| Database (deprecated) | 2, since 7.0.0 | The RTE refuses the app's jobs |

**Test connection** on the runner says which contract the RTE speaks and which one the app needs (see
[Test connection](../runners/runner-page.html#test-connection)), and the **Runners** row of the **Status** page runs the same check.
