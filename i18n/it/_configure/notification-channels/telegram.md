---
layout: default
title: Telegram
parent: Canali di notifica
nav_order: 3
translated_from: c268bd1ed02b399d229ecec8e49d7ba4956ee131
---

# Telegram
{: .no_toc }

Un bot che pubblica in una chat Telegram
{: .fs-6 .fw-300 }

Un canale Telegram è un bot che pubblica in una chat. Il suo passaggio **Credenziali** contiene il **Token del bot**, il suo passaggio **Bot** il resto:

| Campo | Significato |
|---|---|
| Token del bot | Una credenziale **api** di [Connessioni > Credenziali](../credentials.html) la cui password è il token del bot ottenuto da BotFather. |
| Id della chat | La chat, il gruppo o il canale in cui pubblica il bot; un numero negativo per un gruppo o un canale. |
| Indirizzo della Bot API | Un server Bot API tuo; vuoto per `api.telegram.org`. |
