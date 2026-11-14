---
layout: default
title: Mail
parent: Notification channels
nav_order: 1
---

# Mail
{: .no_toc }

Mail servers, the default one, and how they log in
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The mail channel

A mail channel is the server the app sends its mail through: an SMTP server, or Microsoft 365 from 7.6.0. You can keep several;
the one marked **Default** is the server the app sends its mail with when a form names no mail channel:

| Step | Field | Meaning |
|---|---|---|
| Credentials | Credential | An **smtp** credential of [Connections > Credentials](../credentials.html) (the mail server, its port and TLS, and its login, or **No login** for a relay), or a **Microsoft Entra ID** credential to send through [Microsoft 365](microsoft-365.html). Required for a new channel; the step asks nothing else of the server. |
| Credentials | Mail server, Mail port, Use TLS | Not in the dialog. Only on the page of a channel without a credential, or whose smtp credential has no server, see below. |
| Credentials | Send through | Only with a Microsoft Entra ID credential: **Microsoft Graph** (the default) or **SMTP (OAuth2)**, see [Microsoft 365](microsoft-365.html). |
| Sender | Mail from | The sender address recipients see. With Microsoft 365, the mailbox the mail is sent as. |

---

## A relay without a login

A mail server that takes mail without a login (a relay) can be used in two ways, and both send without authentication:

- **An smtp credential with No login** (from 7.6.0): it holds only the **Mail server**, **Mail port** and **Use TLS**, no user nor password.
- **No credential**: a channel without one (from before, or the upgrade's relay, see below) keeps its own **Mail server**, **Mail port** and **Use TLS** on its page.

A channel whose smtp credential has no server (made before credentials held one) keeps its own server, port and TLS on its page
too, where its credential's login signs in. A channel naming a credential with its own server forgets a server typed on it before.

---

## The default channel

The first mail channel becomes the default, and **Make default** in the row menu moves it to another one. The **Default** switch on
the **Details** tab of a mail channel's page does the same.

From 7.6.0, the app sends no mail at all while no mail channel is the default, or while the default one is turned off. Before, it
fell back to the mail settings of the settings page or the config seed. The upgrade to 7.6.0 turns those settings into the default
mail channel `default` when no mail channel was active yet: with a login, it names a new smtp credential `mail-login`; for a relay,
it has its own server and no credential. In the [config seed](../seed/), declare a mail channel under `notification_channels:`
(see [Example](../seed/example.html)): the old `mail_*` keys under `settings:` still work but are deprecated.
