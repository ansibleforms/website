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
| Connection | Mail server | Host name or IP address of the SMTP server. |
| Connection | Mail port | 587 by default; 25 is unencrypted, 465 is SSL. |
| Connection | Use TLS | Encrypt the connection (STARTTLS). On by default. |
| Sender | Mail from | The sender address recipients see. |
| Sender | Credential | An **smtp** credential of [Connections > Credentials](../credentials.html) with the login. Empty for a relay without a login. |

The mail settings of the config seed are used while no mail channel is the default.
