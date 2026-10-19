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
token, or delete the runner so that it asks to join. A [join token](#join-tokens) helps only while that runner still waits for approval.

---

## Approving an RTE

The runners waiting for approval leave the list of **Connections > Runners** for an orange notice above it, such as
**2 Runners are waiting for approval**, with a line per runner: its name, host, IP address, mode, address and fingerprint.
The header bell counts them, for the users who can see the runners (see [the bell](../jobs/#the-jobs-page)).

A click on the notice opens the **Review approval** dialog for each runner in turn; a click on a name opens that one alone.
Its page shows the same facts in a yellow box, **This RTE asked to join**. Check that it is one you started before you approve it:

| Field | What it shows |
|---|---|
| Fingerprint | The first 8 hexadecimal digits of the SHA-256 of its `RTE_TOKEN`, as `abcd-ef12`. The RTE logs it at its start, and the [installer](../installation/installer.html#a-runner) prints it at the end. It must be the same |
| Certificate fingerprint | In the dialog, for an inbound RTE over HTTPS: the first 8 hexadecimal digits of the SHA-256 of the certificate the app pins (its DER bytes), as `abcd-ef12`. The RTE logs it at its start and the [installer](../installation/installer.html#a-runner) prints it at the end. It must be the same |
| Host | The host it runs on |
| IP address | The address it called the app from |
| Mode | Outbound or Inbound |
| Uri | An inbound RTE's address, where the app dials it |
| Version | Its release |
| Asked on | When it asked to join |

**Approve** and **Reject**, in the dialog or in the box on its page, decide:

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
RTE signs in with its own token, so the join token can expire or be revoked without affecting it. Revoking or deleting a join token
leaves the runners it added.

A join token never gives an approved runner a new token. When an RTE runner of that name already exists:

| The runner | What happens |
|---|---|
| Waits for approval | It gets the new token in its credential, and still waits for an admin's approval |
| Is approved | Refused with `409`: *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. The join token is not used up |
| Comes from the [config seed](../seed/) | Refused: *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

An RTE installed again with a new token therefore signs in with the token of its runner's credential, or an admin changes that token
under **Connections > Credentials**, or deletes the runner so that the RTE joins as new.

---

## Registration in database mode

An RTE in database mode, deprecated since 7.3.0, registers itself by default, at its `RTE_URL` or else at its own address and port. The
worker removes such a runner once its RTE has written no heartbeat for 10 minutes. A runner added by hand, by the config seed or by an
RTE in a socket mode is never removed that way.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), which turns this registration on or off, is deprecated in 7.3.0 with
database mode: an RTE in a socket mode asks to join, or joins with a join token. To manage such runners yourself meanwhile, start the
RTE with `RTE_REGISTER=0` and add it here with type RTE, mode **Database (deprecated)**, and an RTE credential with its address and the
same token. To move it to a socket mode, see [Modes](../rte/modes.html#database-deprecated).
