---
layout: default
title: Wyrażenia
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# Wyrażenia
{: .no_toc }

Obliczaj wartości pól w JavaScript, w przeglądarce lub na serwerze
{: .fs-6 .fw-300 }

---

Dla autorów formularzy: wypełniaj pola dynamicznie za pomocą JavaScriptu, obliczając je w przeglądarce lub pobierając na serwerze.

Atrybut `expression` pola formularza pozwala tworzyć dynamiczne formularze z wyrażeniami JavaScript.

---

## Wprowadzenie

Atrybut `expression` jest dostępny w kilku typach pól:
- pole `enum` - do dynamicznego wypełniania opcji listy rozwijanej
- pole `expression` - do pobierania lub generowania dowolnych danych
- pole `html` - do budowania jego treści HTML
- pola `yaml` i `list` - do wypełniania ich danych

Wyrażenia JavaScript są obliczane albo **po stronie serwera** (domyślnie), albo **po stronie klienta**, zależnie od właściwości pola `runLocal`.
Pole `html` oraz typy pól `local`, `local_out` i `credential` zawsze wykonują swoje wyrażenie w przeglądarce, niezależnie od
wartości `runLocal`.

- **Po stronie serwera** (`runLocal: false`, domyślnie) - predefiniowane funkcje, które pobierają dane z API, plików i baz danych.
- **Po stronie klienta** (`runLocal: true`) - kod korzysta z pełnego silnika JavaScript w piaskownicy przeglądarki do obliczeń, przekształceń i operacji na danych.

---

## Kwestie bezpieczeństwa

Ponieważ wyrażenia są obliczane funkcją JavaScript `eval`, wstrzyknięcie kodu jest potencjalnym zagrożeniem:

- **Wyrażenia po stronie serwera** najpierw przechodzą przez sanitizer: każde wywołanie musi być funkcją `fn.` lub `fnc.`, a wiele wierszy,
  `;`, literały szablonowe, `process.env` i sposoby wyjścia z `eval` (`import`, `require`, `constructor`, ...) są odrzucane.
- **Wyrażenia po stronie klienta** są obliczane w piaskownicy przeglądarki i można je uznać za bezpieczne.

To, jak restrykcyjny jest sanitizer, zależy od
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER):

| Wartość | Wyrażenia po stronie serwera |
|---|---|
| `strict` (domyślnie) | wywołania `fn.` i `fnc.` oraz metody na ich wyniku, np. `fn.fnTime().format('YYYY')` |
| `paranoid` | tylko bezpośrednie wywołania `fn.` i `fnc.`, bez metod na ich wyniku |
| `off` | każde wyrażenie po stronie serwera jest odrzucane; działają tylko wyrażenia `runLocal` |
| `legacy` | zasady z wersji 6.2.1, które pozwalały każdemu uwierzytelnionemu użytkownikowi uruchamiać kod na serwerze; tylko na czas aktualizacji i tylko w rzeczywistym środowisku (nie ze strony ustawień) |

Pusta lub nieznana wartość oznacza `strict`. Zmiana obowiązuje od następnego wyrażenia, bez restartu.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [Symbole zastępcze](placeholders.html) | Odwołanie do innego pola, stałej lub użytkownika przez `$(...)` |
| [Wyrażenia lokalne](local.html) | JavaScript wykonywany w piaskownicy przeglądarki |
| [Wyrażenia zdalne](remote.html) | Funkcje po stronie serwera do dat, sieci, plików, SSH i numerowanych nazw |
| [REST API](rest-apis.html) | Wywoływanie REST API z uwierzytelnianiem basic, tokenem lub własnym |
| [Poświadczenia](credentials.html) | Odczyt zapisanego poświadczenia |
| [Sortowanie](sorting.html) | Sortowanie tablic obiektem sortowania |
| [Zapytania jq](jq.html) | Przekształcanie danych za pomocą jq |
