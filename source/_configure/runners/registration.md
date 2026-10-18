---
layout: default
title: Registration
parent: Runners
nav_order: 3
---

# Registration
{: .no_toc }

How an RTE adds itself, with a join token or on its own, and when it is removed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The Registration column

The **Registration** column says how a runner got onto the page:

| Registration | Meaning |
|---|---|
| automatic | An RTE in database mode added itself when it started, and it is still answering. |
| unresponsive | An RTE in database mode that added itself has not answered for two minutes. Once it has been silent for ten minutes, the runner is removed. |
| manual | Added on this page, by the config seed, or by an RTE with a join token. It is never removed automatically. |

The **Mode** column shows an RTE's mode, and the **Socket** column whether an app node holds a socket to an RTE in a socket mode:
*connected* or *not connected* (see [Modes](../rte/modes.html)).

---

## Join tokens

Since 7.3.0, an RTE in a socket mode (`outbound` or `inbound`) adds its runner itself with a join token. **Join tokens**, above the
list of **Connections > Runners**, opens the tokens with these columns:

| Column | Meaning |
|---|---|
| Name | What it is for, such as `dmz-runners` |
| Token | Its first characters only: the token itself is never shown again |
| Status | *usable*, *revoked*, or *expired or used up* |
| Runners added | How many runners it added, out of how many it may add |
| Expires | When it stops adding runners, or *never* |
| Created by | Who made it |

**New join token** asks for three things, then **Create join token** makes it:

| Field | Meaning |
|---|---|
| Name | What it is for |
| Valid for | 1 hour, 1 day (the default), 7 days, 30 days, or Never expires. After this it adds no runner any more; the runners it added stay |
| Runners it may add | How many RTEs may join with it. Empty: any number |

The token, which starts with `afj_`, is shown once, next to a copy button: only its SHA-256 is stored. Below it, the dialog shows the
two ways to use it, with this app's address filled in:

* **The installer** : one line that installs a Runner on a server (see [The installer](../installation/installer.html#a-runner)).
  Its `afjoin2.` string carries the app's address and the token together:

  ```bash
  curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner --join afjoin2.<...>
  ```

* **An RTE container** : the settings to start it with, outbound:

  ```bash
  AF_ROLE=rte
  RTE_MODE=outbound
  APP_URL=https://forms.example.com
  RTE_JOIN_TOKEN=afj_...
  RTE_NAME=<runner-name>
  RTE_TOKEN=<a secret of at least 16 characters>
  ```

Only an admin makes, revokes and deletes join tokens; other users with access to the page see the list.

---

## Joining with a token

The RTE presents the join token once, with its own `RTE_TOKEN` and its `RTE_NAME`: an outbound RTE when it first dials the app, an
inbound one in its registration call. The app then:

1. Stores the RTE's `RTE_TOKEN` in a new credential of type RTE named `<name>-rte` (with a number added when that name is taken), and
   for an inbound RTE its address, `RTE_URL`
2. Adds a runner named after `RTE_NAME`, type RTE, in the RTE's mode, signing in with that credential. Its description names the join
   token it came with
3. Counts one use of the join token

From then on the RTE signs in with its own token, so the join token can expire or be revoked without affecting it. An RTE runner of
that name that already exists, with another token (the RTE was installed again), keeps its row and gets the new token. A runner or a
credential managed by the [config seed](../seed/) is refused: its token is set there.

**Revoke** stops a join token from adding runners, and keeps it in the list; the delete button removes it. Neither touches the runners
it added: remove one under **Connections > Runners**.

---

## Registration in database mode

An RTE in database mode, deprecated since 7.3.0, registers itself by default, at its `RTE_URL` or else at its own address and port. To
manage such runners yourself, start the RTE with `RTE_REGISTER=0` and add it here with type RTE, mode **Database (deprecated)**, and an
RTE credential with its address and the same token.
