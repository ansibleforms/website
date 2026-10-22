---
layout: default
title: Rejestrowanie
parent: Zmienne środowiskowe
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# Rejestrowanie
{: .no_toc }

Poziomy logowania, pliki, syslog i kolory konsoli
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zmień je, aby ustawić, ile jest zapisywane w dzienniku, gdzie trafiają pliki dziennika, albo aby pokazywać znaczniki czasu we własnej strefie czasowej.

---

## Przykład

Zapisuj w plikach więcej niż na konsoli i pokazuj znaczniki czasu dziennika i zadań w czasie Amsterdamu.
W `.env` projektu compose:

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Serwerów syslog nie konfiguruje się już tutaj: dodaj je w **Ustawienia > Połączenia > Syslog**, zobacz [Dzienniki](../production/logs.html#syslog).
Poniższe zmienne `LOG_SYSLOG_*` są przestarzałe od wersji 7. Pierwsze uruchomienie, które znajdzie ustawioną `LOG_SYSLOG_HOST`, importuje je
jednorazowo jako serwer syslog `syslog`, który otrzymuje dziennik serwera, i od tej pory je ignoruje.

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="logging" %}
