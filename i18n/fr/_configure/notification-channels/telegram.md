---
layout: default
title: Telegram
parent: Canaux de notification
nav_order: 3
translated_from: c268bd1ed02b399d229ecec8e49d7ba4956ee131
---

# Telegram
{: .no_toc }

Un bot qui publie dans un chat Telegram
{: .fs-6 .fw-300 }

Un canal Telegram est un bot qui publie dans un chat. Son étape **Identifiants** contient le **Jeton du bot**, son étape **Bot** le reste :

| Champ | Signification |
|---|---|
| Jeton du bot | Un identifiant **api** de [Connexions > Identifiants](../credentials.html) dont le mot de passe est le jeton du bot fourni par BotFather. |
| Id du chat | Le chat, le groupe ou le canal dans lequel le bot publie ; un nombre négatif pour un groupe ou un canal. |
| Adresse de l'API Bot | Un serveur Bot API à vous ; vide pour `api.telegram.org`. |
