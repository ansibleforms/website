---
layout: default
title: Wdrażanie
parent: Weryfikacja uruchomienia
nav_order: 7
translated_from: 399d39dbea694518926bcc20099d19438cbbac29
---

# Wdrażanie
{: .no_toc }

Przejście instancji na enforce i znane ograniczenia
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wdrażanie

`enforce` jest wartością domyślną. W instancji, w której skrypty lub inne systemy uruchamiają formularze przez
REST, dochodź do niego etapami, obserwując log, zanim cokolwiek zostanie odrzucone:

1. Ustaw `LAUNCH_VALIDATION=log` dla całej instancji (przed aktualizacją, przy aktualizacji).
2. Działaj w tym trybie przez jakiś czas i przeglądaj log: ostrzeżenia `would refuse` wskazują uruchomienia,
   które łamią reguły; ostrzeżenia `extravars differ` wskazują formularze, które obliczają coś
   inaczej na serwerze (znacznik czasu, dane zewnętrzne). Zdecyduj dla każdego formularza, czy ma to
   znaczenie.
3. Przełącz te formularze na `launchValidation: enforce`. Wywołujący, którzy wysyłali nieprawidłowe wartości lub
   zmyślone extravars, dostają teraz `422` z powodem.
4. Gdy każdy formularz zachowuje się zgodnie z oczekiwaniami, usuń `LAUNCH_VALIDATION` (lub ustaw ją na `enforce`) dla całej instancji.

---

## Ograniczenia

Weryfikacja uruchomienia nie obejmuje jeszcze wszystkiego:

- **Formularzy kreatora** nie można uruchomić ponownie ze zmianami, a zadania kreatora uruchomionego przed wersją 7.0
  nie można uruchomić ponownie w trybie `enforce` (nie zapisywało wartości kroków). Serwer MCP
  nie może uruchamiać formularzy kreatora.
- **Rozwiązywanie symboli zastępczych** w przeglądarce nadal używa własnej kopii kodu serwera; w
  rzadkich przypadkach brzegowych (`__undefined__`, cudzysłowy wewnątrz wyrażeń) oba mogą rozwiązać
  symbol zastępczy inaczej. `log` ujawnia takie różnice.
- Wyrażenia **`runLocal`** działają w silniku JavaScript przeglądarki, gdy są w przeglądarce, a na serwerze w
  piaskownicy; ten sam kod daje ten sam wynik, z wyjątkiem sytuacji, gdy zależy od
  strefy czasowej lub ustawień regionalnych przeglądarki.

---

## Formularze kreatora

[Kreator](../forms/wizard.html) jest sprawdzany krok po kroku: przeglądarka wysyła wartości
każdego kroku, a serwer sprawdza każdy krok, który użytkownik by wysłał, względem jego własnego podformularza.

- Krok jest pomijany, gdy jest `optional` i użytkownik go pominął albo gdy jego `when` jest fałszywe.
- Krok odczytuje wcześniejsze kroki przez `$(__parent__.<step>.<field>)`, z ich sprawdzonymi wartościami.
- Błędy wskazują krok i pole jako `<step>.<field>`.
- W trybie `enforce` extravars są budowane na serwerze, każdy krok pod swoim `defaultModel`.
- Pola plików nie są obsługiwane w kreatorze.
