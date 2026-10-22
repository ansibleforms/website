---
layout: default
title: Telegram
parent: Kanały powiadomień
nav_order: 3
translated_from: c268bd1ed02b399d229ecec8e49d7ba4956ee131
---

# Telegram
{: .no_toc }

Bot piszący na czacie Telegram
{: .fs-6 .fw-300 }

Kanał Telegram to bot piszący na czacie. Jego krok **Poświadczenia** zawiera **Token bota**, a krok **Bot** resztę:

| Pole | Znaczenie |
|---|---|
| Token bota | Poświadczenie **api** z [Połączenia > Poświadczenia](../credentials.html), którego hasło jest tokenem bota od BotFather. |
| Id czatu | Czat, grupa lub kanał, w którym pisze bot; liczba ujemna dla grupy lub kanału. |
| Adres Bot API | Własny serwer Bot API; puste dla `api.telegram.org`. |
