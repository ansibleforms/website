---
layout: default
title: Asystent czatu
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# Asystent czatu
{: .no_toc }

Wypełniaj i uruchamiaj formularze w rozmowie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów, którzy go włączają, i użytkowników, którzy z nim rozmawiają: wypełniaj i uruchamiaj formularze w rozmowie.

Przycisk czatu na każdej stronie otwiera
asystenta, który znajduje właściwy formularz, pyta o brakujące informacje, oferuje własne opcje
formularza jako przyciski i pokazuje podsumowanie z przyciskiem **Uruchom**. Zadanie rozpoczyna się dopiero wtedy, gdy użytkownik go kliknie.

---

## Jak to działa

Asystent komunikuje się z modelem AI przez serwer, który odpowiada na żądania modelu za pomocą tego samego silnika formularzy co przeglądarka:

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **Wywołania modelu pochodzą z serwera**, nigdy z przeglądarki, więc klucz API pozostaje na serwerze
  (zobacz [Dostawcy](providers.html)).
- **Model nie może niczego uruchomić.** Przygotowuje jednorazowe podsumowanie; przycisk Uruchom sprawdza je ponownie przed uruchomieniem.
- **To użytkownik wybiera cele.** Opcje i wymagane nazwy pochodzą od użytkownika, nigdy od modelu.
- **Wpisanie „tak” lub „uruchom” nic nie robi.** Zadanie uruchamia tylko przycisk.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Co obejmuje |
|---|---|
| [Włączanie](switching-it-on.html) | Włączenie asystenta i udostępnienie w nim formularzy |
| [Dostawcy](providers.html) | Model językowy stojący za asystentem oraz proxy |
| [Prywatność i limity](privacy-and-limits.html) | Co opuszcza sieć i jakie są limity na użytkownika |
| [Ponowne uruchamianie i audyt](relaunching-and-audit.html) | Ponowne uruchamianie z czatu, ślad audytu i ograniczenia |
