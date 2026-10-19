---
layout: default
title: "A runner's page"
parent: Runners
nav_order: 4
---

# A runner's page
{: .no_toc }

A runner's tabs, an RTE's mode, connection and settings, and Test connection
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tabs

A runner's page shows the steps of its dialog as tabs, plus what runs on it:

| Tab | What it holds |
|---|---|
| Details | The name and description, the **Default** switch and the **Enabled** switch, the same for every type of runner |
| Type | The product, as in the dialog. For an RTE also its **Mode**: **Database (deprecated)**, **Inbound** or **Outbound**, the `RTE_MODE` its RTE runs with (see [Modes](../rte/modes.html)) |
| RTE | An RTE's only: its **Mode** in words and, in a socket mode, its **Connection** and its settings (see [An RTE's settings](#an-rtes-settings)) |
| Credentials | The **Credential** it signs in with, a credential of Connections > Credentials of the runner's type, which holds its token or login and its server's address. An RTE's holds its `RTE_TOKEN`, and the RTE's address unless it is outbound. **Project** for Semaphore, Rundeck and Jenkins |
| Forms | The forms that run on it, and how: **Names it** or **As the default runner**. A row opens the form |
| Jobs | The latest 100 jobs that ran on it, with their status, start, end and duration. A row opens the job |

Each tab has its own address, such as `/settings/runners/<id>/rte`, so a link or a bookmark opens it. A runner without that tab opens on
Details.

The two switches of the Details tab are saved at once. **Default** makes the runner the default of its type; it is turned off by making
another runner the default. **Enabled** turns the runner on or off: turned off, no job goes to it, its type's default included (see
[Default and Enabled](list.html#default-and-enabled)).

An RTE that asked to join opens with a yellow box, **This RTE asked to join**, with its fingerprint and what it said of itself, and
**Approve** and **Reject** (see [Approving an RTE](registration.html#approving-an-rte)). A runner of the [config seed](../seed/) says
so at the top of its page, and is read only.

---

## An RTE's settings

The RTE tab manages an RTE from the app, without editing its environment on the machine it runs on.

**Connection.** An RTE in a socket mode shows a badge: **Connected** or **Not connected**. On hover, **Connected** shows the app node
that holds its socket, the RTE's release, and how many of its jobs run. **Not connected** means no app node holds a socket to it:
check that the RTE runs, its address or `APP_URL`, and its token.

**Settings.** An RTE in outbound or inbound mode has four settings, each empty by default:

| Setting | The same as | What it does |
|---|---|---|
| Max concurrent jobs | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | How many playbooks it runs at once, `10` by default; `0` sets no limit |
| Job files cache | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | How much of the job files the app sent it keeps, in MB, `1024` by default; `0` keeps none |
| Drain time on stop | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | How long a stopping RTE waits for its running playbooks, `25` seconds by default |
| Job files | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Transfer**: the app sends a job's files with the job. **Local**: it runs from its own mounted folders |

**Which value wins.** A value on the page wins over the same variable set on the RTE. A field left empty uses the RTE's own variable,
else the default. Under each field the page says which: **Overrides RTE_MAX_JOBS set on the RTE (3)**, or **Empty: the RTE uses its
own RTE_MAX_JOBS, 3**; the placeholder shows the value an empty field stands for.

**How they reach the RTE.** The settings are stored with the runner in the app's database. The app sends them over the RTE's socket
when it connects and whenever they are saved, and the RTE applies them at once: a smaller cache is trimmed, a new limit counts from the
next job. The RTE keeps them in memory only and writes no file: after a restart it gets them again as it connects, before its first job.

An RTE in database mode (deprecated) has no socket: it reads these settings from its own variables, and the tab says so.

---

## Test connection

The buttons top right act on the runner as it is saved.

Next to **Save** are **Test connection** and **Delete**, and on the Credentials tab **Add credential**, which makes a credential of the
runner's type and chooses it. A token or password is never shown again once saved: change it on the credential.

**Test connection** checks that the runner answers and accepts its token or login, and says so in a message: **Runner connection is
OK**, or why it failed. It runs no job. For an RTE it also checks the contract the RTE speaks (see
[The contract](../rte/images.html#the-contract)):

| RTE | What the test reads | When it fails |
|---|---|---|
| Outbound or Inbound | Who holds its socket, as every app node records it, and what the RTE said when it connected. It calls nothing | No app node holds a socket to it: *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, or for an inbound one, *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. Or the RTE speaks another contract than 3 |
| Database (deprecated) | The RTE's `/rte/v1/health`, called with its token | The RTE does not answer at its address, refuses the token, or speaks another contract than 2 |

The **Connection** badge of the RTE tab shows the same socket state without a test.
