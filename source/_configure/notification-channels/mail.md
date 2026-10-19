---
layout: default
title: Mail
parent: Notification channels
nav_order: 1
---

# Mail
{: .no_toc }

SMTP servers, the default one, and their login
{: .fs-6 .fw-300 }

A mail channel is an SMTP server. You can keep several; the one marked **Default** is the server the app sends its
mail with when a form names no mail channel. The first mail channel becomes the default, and **Make default** moves it.

| Step | Field | Meaning |
|---|---|---|
| Credentials | Credential | Required. An **smtp** credential of [Connections > Credentials](../credentials.html): the mail server, its port and TLS, and the login. For a relay without a login, an smtp credential with no user. |
| Sender | Mail from | The sender address recipients see. |

The **Default** switch on the **Details** tab of a mail channel's page makes it the default, as **Make default** does.
The mail settings of the config seed are used while no mail channel is the default, or while the default one is turned off.
