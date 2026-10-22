---
layout: default
title: Telegram
parent: Canais de notificação
nav_order: 3
translated_from: c268bd1ed02b399d229ecec8e49d7ba4956ee131
---

# Telegram
{: .no_toc }

Um bot que publica num chat do Telegram
{: .fs-6 .fw-300 }

Um canal do Telegram é um bot que publica num chat. O seu passo **Credenciais** contém o **Token do bot**, o seu passo **Bot** o resto:

| Campo | Significado |
|---|---|
| Token do bot | Uma credencial **api** de [Ligações > Credenciais](../credentials.html) cuja palavra-passe é o token do bot obtido no BotFather. |
| Id do chat | O chat, grupo ou canal onde o bot publica; um número negativo para um grupo ou um canal. |
| Endereço da Bot API | Um servidor Bot API próprio; vazio para `api.telegram.org`. |
