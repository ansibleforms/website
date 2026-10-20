---
layout: default
title: Telegram
parent: Canales de notificación
nav_order: 3
translated_from: c268bd1ed02b399d229ecec8e49d7ba4956ee131
---

# Telegram
{: .no_toc }

Un bot que publica en un chat de Telegram
{: .fs-6 .fw-300 }

Un canal de Telegram es un bot que publica en un chat. Su paso **Credenciales** contiene el **Token del bot**, y su paso **Bot** el resto:

| Campo | Significado |
|---|---|
| Token del bot | Una credencial **api** de [Conexiones > Credenciales](../credentials.html) cuya contraseña es el token del bot que da BotFather. |
| Id del chat | El chat, grupo o canal en el que publica el bot; un número negativo para un grupo o un canal. |
| Dirección de la Bot API | Un servidor Bot API propio; vacío para `api.telegram.org`. |
