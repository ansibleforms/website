---
layout: default
title: Funkcje
parent: Zmienne środowiskowe
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# Funkcje
{: .no_toc }

Projektant, MCP, czat, walidacja uruchomień, lista zadań, metryki, API AWX i logowanie zapytań
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zmień je, aby włączyć lub wyłączyć opcjonalne części aplikacji.

---

## Przykład

Udostępnij serwer MCP agentom AI i wymuszaj reguły walidacji formularza przy każdym uruchomieniu. W `.env` projektu compose:

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` i `ENABLE_CHAT` działają bez restartu: są odczytywane przy każdym żądaniu, więc możesz je przełączać na
stronie ustawień. Gdy któraś jest wyłączona, jej punkt końcowy (`/api/v2/mcp` lub `/api/v2/chat`) odpowiada `404`.

Najpierw uruchom na jakiś czas `LAUNCH_VALIDATION=log`: zapisuje w dzienniku to, co `enforce` by odrzuciło, ale tego nie odrzuca. Zobacz [MCP](../mcp/)
i [Rejestrowanie i wymuszanie](../launch-validation/log-and-enforce.html).

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="features" %}
