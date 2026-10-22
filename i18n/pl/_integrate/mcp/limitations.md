---
layout: default
title: Ograniczenia
parent: Serwer MCP
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# Ograniczenia
{: .no_toc }

Wyrażenia wykonywane na serwerze i to, czego serwer MCP nie robi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wyrażenia runLocal

Wyrażenia `runLocal`, pola `local` / `credential` / `html` i wartości domyślne `evalDefault` są
obliczane na serwerze, w osobnym kontekście V8: bez `process`, `require`, sieci ani
timerów, bez kompilowania ciągów znaków do kodu, z limitem czasu 2 sekund i tylko z funkcjami
pomocniczymi, które oferuje przeglądarka (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

Chroni to przed wadliwymi lub niekończącymi się wyrażeniami. Nie jest to piaskownica dla wrogiego kodu
i nie musi nią być: kod pochodzi z definicji formularza, nigdy od wywołującego MCP,
a każda wartość wysłana przez wywołującego jest podstawiana jako literał JavaScript.

Wyrażenie, które korzysta z API przeglądarki (`window`, `document`, `fetch`), nie może tu działać i
zwraca `status: error`.

Wyrażenia po stronie serwera (bez `runLocal`) podlegają tym samym regułom
[`EXPRESSION_SANITIZER`](../customization) co w przypadku przeglądarki.

---

## Ograniczenia

Niektórych formularzy i pól nie można jeszcze używać przez serwer MCP:

- **Formularzy typu kreator** nie można jeszcze uruchamiać. Ich kroki można rozwiązywać przez `subform`.
- **Pól plików** nie można wypełniać; formularz, którego pole pliku ma wartość, jest odrzucany.
- **Wiersze list** (oraz pole `yaml` z podformularzem, które jest jednym takim wierszem): każdy wysłany
  wiersz, z wyjątkiem tego, który zawiera `deleteMarker` listy, jest rozwiązywany przez swój podformularz z
  wartościami formularza jako `__parent__`, a następnie walidowany. Dotyczy to też list zagnieżdżonych, w których
  `__parent__.__parent__` sięga formularza. Wysyłaj zwykłe wiersze, czyli surowe wartości pól
  podformularza. Błędne wiersze są wymieniane dla każdego pola listy w `rowErrors`
  (`vms[1].disks[0].size (missing)` w komunikacie). Przyjmowanych jest najwyżej 500 wierszy na wywołanie,
  łącznie na wszystkich poziomach.
- Enum pozostawiony na `__auto__` nigdy nie jest wypełniany pierwszą opcją; wywołujący musi wybrać.
- Każde żądanie MCP tworzy jeden wpis w dzienniku audytu (akcja „Żądanie MCP (agent AI)”); samo
  zadanie jest zapisywane pod użytkownikiem, jak każde inne uruchomienie.
