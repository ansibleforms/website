---
layout: default
title: Weryfikacja uruchomienia
nav_order: 4
has_children: true
has_toc: false
permalink: /launch-validation/
translated_from: 6b86704480781edc0ab1c24c25993fc2e220abf3
---

# Weryfikacja uruchomienia
{: .no_toc }

Sprawdzanie na serwerze każdego uruchomienia formularza
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów i autorów formularzy: niech serwer sprawdza każde uruchomienie, jego reguły i extravars, niezależnie od tego, kto je wysyła.

Sprawdzenie obowiązuje bez względu na to, kto lub co uruchamia formularz: przeglądarka, skrypt wywołujący REST API
czy agent AI przez serwer MCP.

---

## Dlaczego istnieje

Reguły formularza (`required`, `regex`, `minValue`, `sameAs`, ...) zawsze były sprawdzane
w przeglądarce. Przeglądarka wysyła następnie do `POST /api/v2/job` dwie rzeczy:

- `rawFormData`: wartości pól w takiej postaci, w jakiej wypełnił je użytkownik;
- `extravars`: to, co otrzymuje playbook, zbudowane z tych wartości w przeglądarce.

Bez weryfikacji uruchomienia serwer ufa obu. Każdy z ważnym tokenem może wywołać ten
punkt końcowy bezpośrednio i wysłać dowolne extravars, bez zastosowania regex, pól wymaganych
czy reguł list. Dla formularza używanego wyłącznie w przeglądarce może to być do przyjęcia; dla
formularza, który inne systemy uruchamiają przez REST, oznacza to, że reguły formularza w ogóle nie są egzekwowane.

Serwer nie ma też sposobu, by odróżnić żądanie z przeglądarki od żądania wysłanego przez
skrypt: oba używają tego samego punktu końcowego, tego samego tokenu i tej samej treści, a użytkownicy mogą zmodyfikować
każde żądanie wysyłane przez ich własną przeglądarkę. Sprawdzeniu można ufać tylko na serwerze, a weryfikacja
uruchomienia jest właśnie takim sprawdzeniem.

---

## Trzy drogi wejścia

Sposób weryfikacji uruchomienia zależy od tego, jak ono przychodzi, i od trybu weryfikacji uruchomienia:

| Uruchamiane przez | Weryfikowane | Extravars, z którymi działa zadanie |
|---|---|---|
| **Serwer MCP** (agent AI) | zawsze, na serwerze | zawsze budowane przez serwer |
| **Przeglądarka** lub **REST API**, weryfikacja uruchomienia `off` | tylko w przeglądarce | te, które wysłała przeglądarka (lub wywołujący) |
| **Przeglądarka** lub **REST API**, weryfikacja uruchomienia `log` | na serwerze, odmowy tylko logowane | wysłane; różnice są logowane |
| **Przeglądarka** lub **REST API**, weryfikacja uruchomienia `enforce` | na serwerze, odrzucane, gdy nieprawidłowe | **budowane przez serwer** |

Przeglądarka, serwer MCP i weryfikacja uruchomienia używają tego samego kodu reguł (wspólnego
silnika formularzy): tych samych reguł, w tej samej kolejności, z tymi samymi komunikatami. Błąd, który
pokazuje przeglądarka, serwer odrzuca z tym samym tekstem.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [Włączanie](switching-it-on.html) | Dla całej instancji lub dla jednego formularza |
| [Log i enforce](log-and-enforce.html) | Co każdy tryb robi z uruchomieniem, które łamie reguły |
| [Wiersze list](list-rows-and-subforms.html) | Jak weryfikowane są wiersze pól list |
| [Przesyłanie plików](file-uploads.html) | Jak weryfikowane są pola plików |
| [Hasła](passwords.html) | Jak weryfikowane są pola haseł i jak są trzymane z dala od API |
| [Ponowne uruchamianie](relaunching.html) | Jak weryfikowane jest ponownie uruchomione zadanie |
| [Wdrażanie](rolling-it-out.html) | Przejście instancji na enforce i znane ograniczenia |
