---
layout: default
title: Registration
parent: Runners
nav_order: 3
---

# Registration
{: .no_toc }

How an RTE asks to join and is approved, join tokens for unattended installs, and database mode
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Asking to join

Since 7.3.0, an RTE in a socket mode (`outbound` or `inbound`) that the app does not know yet asks to join, and an admin approves it.
It calls in with its own `RTE_TOKEN` and its `RTE_NAME`: an outbound RTE when it first dials the app, an inbound one in its one
registration call. Without a join token, the app then:

1. Stores the RTE's `RTE_TOKEN` in a new credential of type RTE named `<name>-rte` (with a number added when that name is taken), and
   for an inbound RTE its address, `RTE_URL`
2. Adds a runner named after `RTE_NAME`, type RTE, in the RTE's mode, signing in with that credential, marked **Waiting for approval**
   and turned off. Its description says the host it asked from

An outbound RTE stays connected while it waits, but gets no job. The app does not dial an inbound one until it is approved. Both log
that they wait for an admin to approve them under **Connections > Runners**, with the fingerprint of their token.

An inbound RTE with an `https://` `RTE_URL` also sends its certificate when it asks to join, and the app pins it: from then on the
app dials that RTE only when it presents the same certificate, so a self-signed one works without a CA (see [Inbound](../rte/modes.html#inbound)).

At most 20 RTEs wait for approval at once: more are refused until some are approved or rejected. A request nobody handles within
24 hours is removed by the worker, with its credential.

An RTE named after a runner the app knows already, but with another token, is refused and does not ask to join. Give it that runner's
token, delete the runner so that it asks to join, or give it a [join token](#join-tokens).

---

## Approving an RTE

A runner waiting for approval shows **Waiting for approval** next to its name in the list of **Connections > Runners**. The header bell
counts the runners waiting for approval, for the users who can see the runners (see [the bell](../jobs/#the-jobs-page)).

Its own page opens with a yellow box, **This RTE asked to join**, that shows what the RTE said of itself. Check that it is one you
started before you approve it:

| Field | What it shows |
|---|---|
| Fingerprint | The first 8 hexadecimal digits of the SHA-256 of its `RTE_TOKEN`, as `abcd-ef12`. The RTE logs it at its start, and the [installer](../installation/installer.html#a-runner) prints it at the end. It must be the same |
| Host | The host it runs on |
| Called from | The address it called the app from |
| Certificate | An inbound RTE over HTTPS: the fingerprint of the certificate the app pins, the first 8 hexadecimal digits of its SHA-256. The [installer](../installation/installer.html#a-runner) prints it at the end as **Certificate fingerprint**. It must be the same |
| Mode | Outbound or Inbound |
| Uri | An inbound RTE's address, where the app dials it |
| Version | Its release |
| Asked on | When it asked to join |

**Approve** and **Reject**, in the box or in the row's menu, decide:

| Action | What happens |
|---|---|
| Approve | The runner is enabled and takes jobs from now on. It becomes the default of its type when there is none |
| Reject | The runner is removed with its credential, and its socket is closed. The RTE may ask to join again; it then waits for approval again |

Only an admin approves or rejects an RTE.

---

## Join tokens

A join token approves an RTE at once, for unattended installs: an RTE started with
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), or a Runner installed with the installer's `--join`, presents it once
and its runner is added enabled, without waiting. Join tokens have no page in the interface: an admin makes them through the
[REST API](../api/), under `/api/v2/runner`:

| Call | What it does |
|---|---|
| `POST /api/v2/runner/jointoken` | Makes a join token. The body holds its `name`, and optionally `expiresInHours` (none: it never expires) and `maxUses` (none: any number of RTEs) |
| `GET /api/v2/runner/jointoken` | Lists the join tokens, newest first, with their uses and whether they are still usable; never the tokens themselves |
| `POST /api/v2/runner/jointoken/<id>/revoke` | Revokes it: it adds no runner any more, and stays in the list |
| `DELETE /api/v2/runner/jointoken/<id>` | Deletes it |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

The answer holds the token, which starts with `afj_`, this once: only its SHA-256 is stored. An RTE that presents it gets the same
credential and runner as one that [asks to join](#asking-to-join), enabled, and its description names the join token. From then on the
RTE signs in with its own token, so the join token can expire or be revoked without affecting it. An RTE runner of that name that
already exists, with another token (the RTE was installed again), keeps its row and gets the new token. A runner or a credential
managed by the [config seed](../seed/) is refused: its token is set there. Revoking or deleting a join token leaves the runners it added.

---

## Registration in database mode

An RTE in database mode, deprecated since 7.3.0, registers itself by default, at its `RTE_URL` or else at its own address and port. Such
a runner counts as unresponsive once its RTE has not answered for two minutes, and the worker removes it after ten. A runner added by
hand, by the config seed or by an RTE in a socket mode is never removed that way.

To manage such runners yourself, start the RTE with `RTE_REGISTER=0` and add it here with type RTE, mode **Database (deprecated)**, and an
RTE credential with its address and the same token.
