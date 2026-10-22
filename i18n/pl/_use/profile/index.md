---
layout: default
title: Twój profil
nav_order: 4
description: Twoje konto, preferencje, hasło, uprawnienia i tokeny API
has_children: true
has_toc: false
permalink: /profile/
translated_from: f2ec61e6df09174e802478963ba70ff7dee51098
---

# Twój profil
{: .no_toc }

Twoje konto, preferencje, hasło, uprawnienia i tokeny API
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla każdego użytkownika: twoje własne konto, preferencje, hasło, uprawnienia i tokeny API.

Profil otwierasz z awatara w prawym górnym rogu: **Profil**.

---

## Otwieranie widoku

Lewe menu wymienia widoki profilu w kolejności alfabetycznej. Każdy widok ma własny adres,
więc możesz linkować do niego bezpośrednio:

| Widok | Adres |
|---|---|
| Konto | `/profile/account` |
| Tokeny API | `/profile/token` |
| Hasło | `/profile/password` |
| Uprawnienia | `/profile/permissions` |
| Preferencje | `/profile/preferences` |

Sam `/profile` otwiera pierwszy widok menu. Widoki, na które nie pozwalają twoje role, są ukryte; ich adres otwiera wtedy pierwszy
widok. **Tokeny API** są widoczne tylko wtedy, gdy jedna z twoich ról ma opcję roli `allowApiTokens`.

---

## W tej sekcji

Każdy temat jest opisany na osobnej stronie:

| Strona | Czego dotyczy |
|---|---|
| [Konto](account.html) | Jako kto jesteś zalogowany |
| [Preferencje](preferences.html) | Język, motyw, strefa czasowa, format daty i powiadomienia na pulpicie |
| [Hasło](password.html) | Zmiana hasła konta lokalnego |
| [Uprawnienia](permissions.html) | Co pozwalają ci robić twoje role |
| [Tokeny API](api-token.html) | Tworzenie tokenu dla skryptów i agentów AI |
