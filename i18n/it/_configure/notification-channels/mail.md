---
layout: default
title: Mail
parent: Canali di notifica
nav_order: 1
translated_from: 3ab21a1f2987744527863f5f25ce347dbdf2cd3d
---

# Mail
{: .no_toc }

I server SMTP, quello predefinito, e il loro accesso
{: .fs-6 .fw-300 }

Un canale mail è un server SMTP. Puoi tenerne più di uno; quello contrassegnato come **Predefinito** è il server con cui l'app invia le sue
mail quando un modulo non indica nessun canale mail. Il primo canale mail diventa il predefinito, e **Imposta come predefinito** lo sposta.

| Passaggio | Campo | Significato |
|---|---|---|
| Credenziali | Credenziale | Obbligatoria. Una credenziale **smtp** di [Connessioni > Credenziali](../credentials.html): il server mail, la sua porta e il TLS, e l'accesso. Per un relay senza accesso, una credenziale smtp senza utente. |
| Mittente | Mittente mail | L'indirizzo del mittente che vedono i destinatari. |

L'interruttore **Predefinito** nella scheda **Dettagli** della pagina di un canale mail lo rende il predefinito, come fa **Imposta come predefinito**.
Le impostazioni mail del config seed si usano finché nessun canale mail è il predefinito, o finché quello predefinito è disattivato.
