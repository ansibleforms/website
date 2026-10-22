---
layout: default
title: Telegram
parent: Benachrichtigungskanäle
nav_order: 3
translated_from: c268bd1ed02b399d229ecec8e49d7ba4956ee131
---

# Telegram
{: .no_toc }

Ein Bot, der in einem Telegram-Chat postet
{: .fs-6 .fw-300 }

Ein Telegram-Kanal ist ein Bot, der in einem Chat postet. Sein Schritt **Anmeldedaten** enthält das **Bot-Token**, sein Schritt **Bot** den Rest:

| Feld | Bedeutung |
|---|---|
| Bot-Token | Ein **api**-Eintrag aus [Verbindungen > Anmeldedaten](../credentials.html), dessen Passwort das Bot-Token von BotFather ist. |
| Chat-ID | Der Chat, die Gruppe oder der Kanal, in dem der Bot postet; eine negative Zahl bei einer Gruppe oder einem Kanal. |
| Bot-API-Adresse | Ein eigener Bot-API-Server; leer für `api.telegram.org`. |
