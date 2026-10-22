---
layout: default
title: Il tuo profilo
nav_order: 4
description: Il tuo account, preferenze, password, permessi e token API
has_children: true
has_toc: false
permalink: /profile/
translated_from: f2ec61e6df09174e802478963ba70ff7dee51098
---

# Il tuo profilo
{: .no_toc }

Il tuo account, preferenze, password, permessi e token API
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per ogni utente: il tuo account, le preferenze, la password, i permessi e i token API.

Apri il tuo profilo dall'avatar in alto a destra: **Profilo**.

---

## Aprire una vista

Il menu a sinistra elenca le viste del profilo in ordine alfabetico. Ogni vista ha un proprio indirizzo,
così puoi collegarti direttamente a essa:

| Vista | Indirizzo |
|---|---|
| Account | `/profile/account` |
| Token API | `/profile/token` |
| Password | `/profile/password` |
| Permessi | `/profile/permissions` |
| Preferenze | `/profile/preferences` |

`/profile` da solo apre la prima vista del menu. Le viste che i tuoi ruoli non consentono sono nascoste; il loro indirizzo apre invece la prima
vista. **Token API** viene mostrata solo quando uno dei tuoi ruoli ha l'opzione di ruolo `allowApiTokens`.

---

## In questa sezione

Ogni argomento è descritto in una pagina dedicata:

| Pagina | Cosa tratta |
|---|---|
| [Account](account.html) | Con quale utente hai effettuato l'accesso |
| [Preferenze](preferences.html) | Lingua, tema, fuso orario, formato data e notifiche desktop |
| [Password](password.html) | Cambiare la password di un account locale |
| [Permessi](permissions.html) | Cosa ti permettono di fare i tuoi ruoli |
| [Token API](api-token.html) | Creare un token per script e agenti IA |
