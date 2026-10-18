---
layout: default
title: "A runner's page"
parent: Runners
nav_order: 4
---

# A runner's page
{: .no_toc }

A runner's tabs, an RTE's mode and socket, and Test connection
{: .fs-6 .fw-300 }

A runner's page shows the steps of its dialog as tabs, plus what runs on it:

| Tab | What it holds |
|---|---|
| Details | The registration, name and description, and the **Default** switch. Turning it on makes the runner the default of its type; it is turned off by making another runner the default. For an RTE in a socket mode, a pill next to the registration says whether its socket is *connected* |
| Type | The product, as in the dialog. For an RTE also its **Mode**: **Outbound**, **Inbound** or **Database (deprecated)**, the `RTE_MODE` its RTE runs with (see [Modes](../rte/modes.html)) |
| Credentials | The **Credential** it signs in with, a credential of Connections > Credentials of the runner's type, which holds its token or login and its server's address. An RTE's holds its `RTE_TOKEN`, and the RTE's address unless it is outbound. **Project** for Semaphore, Rundeck and Jenkins |
| Forms | The forms that run on it, and how: **Names it** or **As the default runner**. A row opens the form |
| Jobs | The latest 100 jobs that ran on it, with their status, start, end and duration. A row opens the job |

The socket pill of an RTE shows, on hover, the app node that holds its socket, the RTE's release, and how many of its jobs run out of
[`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS). *not connected* means no app node holds a socket to it: check that the
RTE runs, its address or `APP_URL`, and its token.

Next to **Save**, top right, are **Test connection** and **Delete**, and on the Credentials tab **Add credential**, which makes a
credential of the runner's type and chooses it. A token or password is never shown again once saved: change it on the credential.

**Test connection** checks that the runner answers and accepts its token or login. For an RTE it also shows its
release and its Ansible version, and refuses an RTE that needs to be updated to work with this app.
